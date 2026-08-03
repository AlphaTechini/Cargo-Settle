import { and, eq } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireAccessRole, requireWorkspaceMember } from '$lib/server/auth/authorization';
import { getDb } from '$lib/server/db';
import { workspaceMembers } from '$lib/server/db/schema';
import { WorkspaceServiceError } from '$lib/server/workspaces';

export const POST: RequestHandler = async (event) => {
	try {
		const context = requireAccessRole(
			await requireWorkspaceMember(event, event.params.workspaceId),
			['owner']
		);
		const body = (await event.request.json()) as { userId?: unknown };
		if (typeof body.userId !== 'string' || body.userId.length === 0) {
			throw new WorkspaceServiceError('userId is required', 400);
		}
		const db = getDb();
		const targetUserId = body.userId;
		const result = await db.transaction(async (tx) => {
			const [target] = await tx
				.select({ id: workspaceMembers.id, accessRole: workspaceMembers.accessRole })
				.from(workspaceMembers)
				.where(
					and(
						eq(workspaceMembers.workspaceId, context.workspace.id),
						eq(workspaceMembers.userId, targetUserId)
					)
				)
				.limit(1);
			if (!target) throw new WorkspaceServiceError('Target member not found', 404);
			if (target.accessRole === 'owner')
				throw new WorkspaceServiceError('User is already the owner', 409);
			await tx
				.update(workspaceMembers)
				.set({ accessRole: 'admin' })
				.where(eq(workspaceMembers.id, context.membership.id));
			const [owner] = await tx
				.update(workspaceMembers)
				.set({ accessRole: 'owner' })
				.where(eq(workspaceMembers.id, target.id))
				.returning({ userId: workspaceMembers.userId, accessRole: workspaceMembers.accessRole });
			return owner;
		});
		return json({ owner: result });
	} catch (error) {
		return authErrorResponse(error);
	}
};
