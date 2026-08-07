import { and, asc, eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { workspaceMembers, workspaces } from '$lib/server/db/schema';
import type { AccessRole, BusinessRole } from './types';
import type { AuthUser } from './sessions';

export type WorkspaceContext = {
	user: NonNullable<RequestEvent['locals']['user']>;
	workspace: {
		id: string;
		name: string;
		slug: string;
	};
	membership: {
		id: string;
		businessRole: BusinessRole;
		accessRole: AccessRole;
	};
};

export class AuthorizationError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
	}
}

export function requireUser(event: RequestEvent): AuthUser {
	if (!event.locals.user) throw new AuthorizationError('Authentication required', 401);
	return event.locals.user;
}

export async function requireWorkspaceMember(event: RequestEvent, workspaceId?: string) {
	const user = requireUser(event);
	const explicitWorkspaceId = workspaceId;
	const selectedWorkspaceId = explicitWorkspaceId ?? event.cookies.get('cargosettle_workspace');
	const db = getDb();
	const filters = [eq(workspaceMembers.userId, user.id)];
	if (selectedWorkspaceId) filters.push(eq(workspaceMembers.workspaceId, selectedWorkspaceId));

	let [row] = await db
		.select({
			workspace: {
				id: workspaces.id,
				name: workspaces.name,
				slug: workspaces.slug
			},
			membership: {
				id: workspaceMembers.id,
				businessRole: workspaceMembers.businessRole,
				accessRole: workspaceMembers.accessRole
			}
		})
		.from(workspaceMembers)
		.innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
		.where(and(...filters))
		.orderBy(asc(workspaces.createdAt), asc(workspaceMembers.joinedAt))
		.limit(1);

	if (!row && !explicitWorkspaceId && selectedWorkspaceId) {
		[row] = await db
			.select({
				workspace: {
					id: workspaces.id,
					name: workspaces.name,
					slug: workspaces.slug
				},
				membership: {
					id: workspaceMembers.id,
					businessRole: workspaceMembers.businessRole,
					accessRole: workspaceMembers.accessRole
				}
			})
			.from(workspaceMembers)
			.innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
			.where(eq(workspaceMembers.userId, user.id))
			.orderBy(asc(workspaces.createdAt), asc(workspaceMembers.joinedAt))
			.limit(1);
	}

	if (!row) throw new AuthorizationError('Workspace access denied', 404);
	return { user, ...row } satisfies WorkspaceContext;
}

export function requireAccessRole(context: WorkspaceContext, allowed: AccessRole[]) {
	if (!allowed.includes(context.membership.accessRole)) {
		throw new AuthorizationError('Workspace permission denied', 403);
	}
	return context;
}

export function requireBusinessRole(context: WorkspaceContext, allowed: BusinessRole[]) {
	if (!allowed.includes(context.membership.businessRole)) {
		throw new AuthorizationError('Business role is not allowed for this operation', 403);
	}
	return context;
}
