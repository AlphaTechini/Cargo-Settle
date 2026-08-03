import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { workspaceMembers, workspaces } from '$lib/server/db/schema';
import type { AccessRole, BusinessRole } from './auth/types';

export const ACTIVE_WORKSPACE_COOKIE = 'cargosettle_workspace';

export class WorkspaceServiceError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
	}
}

export type WorkspaceInput = {
	name: string;
	businessRole: BusinessRole;
};

function workspaceSlug(name: string) {
	const normalized = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	return `${normalized || 'workspace'}-${randomUUID().slice(0, 8)}`;
}

export async function listUserWorkspaces(userId: string) {
	const db = getDb();
	return db
		.select({
			id: workspaces.id,
			name: workspaces.name,
			slug: workspaces.slug,
			businessRole: workspaceMembers.businessRole,
			accessRole: workspaceMembers.accessRole
		})
		.from(workspaceMembers)
		.innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
		.where(eq(workspaceMembers.userId, userId));
}

export async function getUserWorkspace(userId: string, workspaceId: string) {
	const db = getDb();
	const [workspace] = await db
		.select({
			id: workspaces.id,
			name: workspaces.name,
			slug: workspaces.slug,
			businessRole: workspaceMembers.businessRole,
			accessRole: workspaceMembers.accessRole
		})
		.from(workspaceMembers)
		.innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
		.where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, workspaceId)))
		.limit(1);
	return workspace ?? null;
}

export async function createWorkspaceForUser(userId: string, input: WorkspaceInput) {
	const db = getDb();
	return db.transaction(async (tx) => {
		const [workspace] = await tx
			.insert(workspaces)
			.values({ name: input.name, slug: workspaceSlug(input.name), createdBy: userId })
			.returning({ id: workspaces.id, name: workspaces.name, slug: workspaces.slug });
		await tx.insert(workspaceMembers).values({
			workspaceId: workspace.id,
			userId,
			businessRole: input.businessRole,
			accessRole: 'owner'
		});
		return { ...workspace, businessRole: input.businessRole, accessRole: 'owner' as AccessRole };
	});
}
