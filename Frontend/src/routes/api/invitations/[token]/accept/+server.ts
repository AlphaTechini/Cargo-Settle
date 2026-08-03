import { dev } from '$app/environment';
import { and, eq, gt } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireUser } from '$lib/server/auth/authorization';
import { hashToken } from '$lib/server/auth/sessions';
import { getDb } from '$lib/server/db';
import { workspaceInvitations, workspaceMembers, workspaces } from '$lib/server/db/schema';
import { ACTIVE_WORKSPACE_COOKIE, WorkspaceServiceError } from '$lib/server/workspaces';

export const POST: RequestHandler = async (event) => {
	try {
		const user = requireUser(event);
		const token = event.params.token;
		if (!token) throw new WorkspaceServiceError('Invitation token is required', 400);
		const db = getDb();
		const [invitation] = await db
			.select({
				id: workspaceInvitations.id,
				workspaceId: workspaceInvitations.workspaceId,
				email: workspaceInvitations.email,
				businessRole: workspaceInvitations.businessRole,
				accessRole: workspaceInvitations.accessRole,
				expiresAt: workspaceInvitations.expiresAt,
				workspaceName: workspaces.name,
				workspaceSlug: workspaces.slug
			})
			.from(workspaceInvitations)
			.innerJoin(workspaces, eq(workspaceInvitations.workspaceId, workspaces.id))
			.where(
				and(
					eq(workspaceInvitations.tokenHash, hashToken(token)),
					eq(workspaceInvitations.status, 'pending'),
					gt(workspaceInvitations.expiresAt, new Date())
				)
			)
			.limit(1);
		if (!invitation) throw new WorkspaceServiceError('Invitation is invalid or expired', 410);
		if (invitation.email !== user.email) {
			throw new WorkspaceServiceError('Invitation email does not match the signed-in account', 403);
		}

		const workspace = await db.transaction(async (tx) => {
			const [existingMember] = await tx
				.select({ id: workspaceMembers.id })
				.from(workspaceMembers)
				.where(
					and(
						eq(workspaceMembers.workspaceId, invitation.workspaceId),
						eq(workspaceMembers.userId, user.id)
					)
				)
				.limit(1);
			if (existingMember)
				throw new WorkspaceServiceError('User is already a workspace member', 409);
			await tx.insert(workspaceMembers).values({
				workspaceId: invitation.workspaceId,
				userId: user.id,
				businessRole: invitation.businessRole,
				accessRole: invitation.accessRole
			});
			await tx
				.update(workspaceInvitations)
				.set({ status: 'accepted', tokenHash: null, acceptedAt: new Date() })
				.where(eq(workspaceInvitations.id, invitation.id));
			return {
				id: invitation.workspaceId,
				name: invitation.workspaceName,
				slug: invitation.workspaceSlug
			};
		});

		event.cookies.set(ACTIVE_WORKSPACE_COOKIE, workspace.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 24 * 30
		});
		return json({ workspace }, { status: 201 });
	} catch (error) {
		return authErrorResponse(error);
	}
};
