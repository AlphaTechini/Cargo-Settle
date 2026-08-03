import { dev } from '$app/environment';
import { randomBytes } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireAccessRole, requireWorkspaceMember } from '$lib/server/auth/authorization';
import { hashToken } from '$lib/server/auth/sessions';
import { getDb } from '$lib/server/db';
import { workspaceInvitations } from '$lib/server/db/schema';
import { WorkspaceServiceError } from '$lib/server/workspaces';

async function getInvitation(event: Parameters<RequestHandler>[0]) {
	const invitationId = event.params.invitationId;
	if (!invitationId) throw new WorkspaceServiceError('invitationId is required', 400);
	const context = requireAccessRole(await requireWorkspaceMember(event, event.params.workspaceId), [
		'owner',
		'admin'
	]);
	const db = getDb();
	const [invitation] = await db
		.select({
			id: workspaceInvitations.id,
			email: workspaceInvitations.email,
			status: workspaceInvitations.status
		})
		.from(workspaceInvitations)
		.where(
			and(
				eq(workspaceInvitations.id, invitationId),
				eq(workspaceInvitations.workspaceId, context.workspace.id)
			)
		)
		.limit(1);
	if (!invitation) throw new WorkspaceServiceError('Invitation not found', 404);
	return { context, invitation, db };
}

export const DELETE: RequestHandler = async (event) => {
	try {
		const { invitation, db } = await getInvitation(event);
		if (invitation.status !== 'pending') {
			throw new WorkspaceServiceError('Only pending invitations can be cancelled', 409);
		}
		await db.delete(workspaceInvitations).where(eq(workspaceInvitations.id, invitation.id));
		return json({ ok: true });
	} catch (error) {
		return authErrorResponse(error);
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const { invitation, db } = await getInvitation(event);
		if (invitation.status !== 'pending') {
			throw new WorkspaceServiceError('Only pending invitations can be resent', 409);
		}
		const token = randomBytes(32).toString('base64url');
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		const [updated] = await db
			.update(workspaceInvitations)
			.set({ tokenHash: hashToken(token), expiresAt })
			.where(eq(workspaceInvitations.id, invitation.id))
			.returning({ id: workspaceInvitations.id, expiresAt: workspaceInvitations.expiresAt });
		return json({ invitation: updated, invitationToken: dev ? token : undefined });
	} catch (error) {
		return authErrorResponse(error);
	}
};
