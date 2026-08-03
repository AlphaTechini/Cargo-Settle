import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from '$lib/server/db';
import { users, workspaceMembers, workspaces } from '$lib/server/db/schema';
import { hashPassword, verifyPassword } from './password';
import { createSession, SESSION_TTL_SHORT_SECONDS } from './sessions';
import type { BusinessRole } from './types';

export class AuthServiceError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
	}
}

function workspaceSlug(name: string) {
	const normalized = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	return `${normalized || 'workspace'}-${randomUUID().slice(0, 8)}`;
}

export async function registerUser(input: {
	email: string;
	password: string;
	displayName: string;
	workspaceName: string;
	businessRole: BusinessRole;
}) {
	const db = getDb();
	const existing = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, input.email))
		.limit(1);
	if (existing.length > 0)
		throw new AuthServiceError('An account with that email already exists', 409);

	const passwordHash = await hashPassword(input.password);
	const created = await db.transaction(async (tx) => {
		const [user] = await tx
			.insert(users)
			.values({ email: input.email, passwordHash, displayName: input.displayName })
			.returning({ id: users.id, email: users.email, displayName: users.displayName });
		const [workspace] = await tx
			.insert(workspaces)
			.values({
				name: input.workspaceName,
				slug: workspaceSlug(input.workspaceName),
				createdBy: user.id
			})
			.returning({ id: workspaces.id, name: workspaces.name, slug: workspaces.slug });
		await tx.insert(workspaceMembers).values({
			workspaceId: workspace.id,
			userId: user.id,
			businessRole: input.businessRole,
			accessRole: 'owner'
		});
		return { user, workspace };
	});

	const session = await createSession(created.user.id);
	return { ...created, session };
}

export async function loginUser(input: { email: string; password: string; rememberMe: boolean }) {
	const db = getDb();
	const [user] = await db
		.select({
			id: users.id,
			email: users.email,
			displayName: users.displayName,
			passwordHash: users.passwordHash
		})
		.from(users)
		.where(eq(users.email, input.email))
		.limit(1);

	if (!user || !(await verifyPassword(user.passwordHash, input.password))) {
		throw new AuthServiceError('Invalid email or password', 401);
	}

	const [membership] = await db
		.select({ businessRole: workspaceMembers.businessRole })
		.from(workspaceMembers)
		.where(eq(workspaceMembers.userId, user.id))
		.limit(1);
	const session = await createSession(
		user.id,
		input.rememberMe ? undefined : SESSION_TTL_SHORT_SECONDS
	);
	return {
		user: { id: user.id, email: user.email, displayName: user.displayName },
		businessRole: membership?.businessRole ?? null,
		session
	};
}
