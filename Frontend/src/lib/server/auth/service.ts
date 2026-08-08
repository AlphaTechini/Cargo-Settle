import { and, asc, eq, gt, inArray } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from '$lib/server/db';
import { users, workspaceInvitations, workspaceMembers, workspaces } from '$lib/server/db/schema';
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

async function acceptPendingInvitations(
	db: ReturnType<typeof getDb>,
	userId: string,
	email: string
) {
	return db.transaction(async (tx) => {
		const pending = await tx
			.select({
				id: workspaceInvitations.id,
				workspaceId: workspaceInvitations.workspaceId,
				businessRole: workspaceInvitations.businessRole,
				accessRole: workspaceInvitations.accessRole,
				workspace: {
					id: workspaces.id,
					name: workspaces.name,
					slug: workspaces.slug
				}
			})
			.from(workspaceInvitations)
			.innerJoin(workspaces, eq(workspaceInvitations.workspaceId, workspaces.id))
			.where(
				and(
					eq(workspaceInvitations.email, email),
					eq(workspaceInvitations.status, 'pending'),
					gt(workspaceInvitations.expiresAt, new Date())
				)
			)
			.orderBy(asc(workspaceInvitations.createdAt));

		if (pending.length === 0) return [];

		await tx
			.insert(workspaceMembers)
			.values(
				pending.map((invitation) => ({
					workspaceId: invitation.workspaceId,
					userId,
					businessRole: invitation.businessRole,
					accessRole: invitation.accessRole
				}))
			)
			.onConflictDoNothing();
		await tx
			.update(workspaceInvitations)
			.set({ status: 'accepted', tokenHash: null, acceptedAt: new Date() })
			.where(
				inArray(
					workspaceInvitations.id,
					pending.map((invitation) => invitation.id)
				)
			);

		return pending.map((invitation) => ({
			businessRole: invitation.businessRole,
			workspace: invitation.workspace
		}));
	});
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
		const pendingInvitations = await tx
			.select({
				id: workspaceInvitations.id,
				workspaceId: workspaceInvitations.workspaceId,
				businessRole: workspaceInvitations.businessRole,
				accessRole: workspaceInvitations.accessRole,
				workspace: {
					id: workspaces.id,
					name: workspaces.name,
					slug: workspaces.slug
				}
			})
			.from(workspaceInvitations)
			.innerJoin(workspaces, eq(workspaceInvitations.workspaceId, workspaces.id))
			.where(
				and(
					eq(workspaceInvitations.email, input.email),
					eq(workspaceInvitations.status, 'pending'),
					gt(workspaceInvitations.expiresAt, new Date())
				)
			)
			.orderBy(asc(workspaceInvitations.createdAt));

		if (pendingInvitations.length > 0) {
			await tx.insert(workspaceMembers).values(
				pendingInvitations.map((invitation) => ({
					workspaceId: invitation.workspaceId,
					userId: user.id,
					businessRole: invitation.businessRole,
					accessRole: invitation.accessRole
				}))
			);
			await tx
				.update(workspaceInvitations)
				.set({ status: 'accepted', tokenHash: null, acceptedAt: new Date() })
				.where(
					inArray(
						workspaceInvitations.id,
						pendingInvitations.map((invitation) => invitation.id)
					)
				);
			return {
				user,
				workspace: pendingInvitations[0].workspace,
				businessRole: pendingInvitations[0].businessRole
			};
		}

		if (input.businessRole !== 'freight_forwarder') {
			throw new AuthServiceError(
				'An invitation from a freight forwarder is required for this role',
				403
			);
		}

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
		return { user, workspace, businessRole: input.businessRole };
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
	const acceptedInvitations = await acceptPendingInvitations(db, user.id, user.email);

	const [membership] = await db
		.select({
			businessRole: workspaceMembers.businessRole,
			workspace: {
				id: workspaces.id,
				name: workspaces.name,
				slug: workspaces.slug
			}
		})
		.from(workspaceMembers)
		.innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
		.where(eq(workspaceMembers.userId, user.id))
		.orderBy(asc(workspaces.createdAt), asc(workspaceMembers.joinedAt))
		.limit(1);
	const selectedMembership = acceptedInvitations[0] ?? membership;
	const session = await createSession(
		user.id,
		input.rememberMe ? undefined : SESSION_TTL_SHORT_SECONDS
	);
	return {
		user: { id: user.id, email: user.email, displayName: user.displayName },
		businessRole: selectedMembership?.businessRole ?? null,
		workspace: selectedMembership?.workspace ?? null,
		acceptedWorkspaces: acceptedInvitations.map((invitation) => invitation.workspace),
		session
	};
}
