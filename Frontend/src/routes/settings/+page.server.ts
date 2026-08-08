import { and, asc, eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AuthorizationError, requireWorkspaceMember } from '$lib/server/auth/authorization';
import { getDb } from '$lib/server/db';
import { users, workspaceInvitations, workspaceMembers } from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
	try {
		const context = await requireWorkspaceMember(event);
		const db = getDb();
		const members = await db
			.select({
				userId: users.id,
				email: users.email,
				displayName: users.displayName,
				businessRole: workspaceMembers.businessRole,
				accessRole: workspaceMembers.accessRole,
				joinedAt: workspaceMembers.joinedAt
			})
			.from(workspaceMembers)
			.innerJoin(users, eq(workspaceMembers.userId, users.id))
			.where(eq(workspaceMembers.workspaceId, context.workspace.id))
			.orderBy(asc(workspaceMembers.joinedAt));

		const canManage = ['owner', 'admin'].includes(context.membership.accessRole);
		const invitations = canManage
			? await db
					.select({
						id: workspaceInvitations.id,
						email: workspaceInvitations.email,
						businessRole: workspaceInvitations.businessRole,
						accessRole: workspaceInvitations.accessRole,
						status: workspaceInvitations.status,
						expiresAt: workspaceInvitations.expiresAt,
						createdAt: workspaceInvitations.createdAt
					})
					.from(workspaceInvitations)
					.where(
						and(
							eq(workspaceInvitations.workspaceId, context.workspace.id),
							eq(workspaceInvitations.status, 'pending')
						)
					)
					.orderBy(asc(workspaceInvitations.createdAt))
			: [];

		return {
			settings: {
				workspace: context.workspace,
				membership: context.membership,
				members: members.map((member) => ({ ...member, joinedAt: member.joinedAt.toISOString() })),
				invitations: invitations.map((invitation) => ({
					...invitation,
					expiresAt: invitation.expiresAt.toISOString(),
					createdAt: invitation.createdAt.toISOString()
				})),
				canManage
			}
		};
	} catch (loadError) {
		if (loadError instanceof AuthorizationError) {
			if (loadError.status === 401) redirect(303, '/auth-login');
			error(loadError.status, loadError.message);
		}
		throw loadError;
	}
};
