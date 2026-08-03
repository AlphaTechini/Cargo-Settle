import { and, eq } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireAccessRole, requireWorkspaceMember } from '$lib/server/auth/authorization';
import { getDb } from '$lib/server/db';
import { workspaceMembers } from '$lib/server/db/schema';

export const DELETE: RequestHandler = async (event) => {
	try {
		const userId = event.params.userId;
		if (!userId) return json({ error: 'userId is required' }, { status: 400 });
		const context = requireAccessRole(
			await requireWorkspaceMember(event, event.params.workspaceId),
			['owner', 'admin']
		);
		const db = getDb();
		const [target] = await db
			.select({ id: workspaceMembers.id, accessRole: workspaceMembers.accessRole })
			.from(workspaceMembers)
			.where(
				and(
					eq(workspaceMembers.workspaceId, context.workspace.id),
					eq(workspaceMembers.userId, userId)
				)
			)
			.limit(1);
		if (!target) return json({ error: 'Member not found' }, { status: 404 });
		if (target.accessRole === 'owner') {
			return json(
				{ error: 'Transfer workspace ownership before removing the owner' },
				{ status: 409 }
			);
		}
		await db.delete(workspaceMembers).where(eq(workspaceMembers.id, target.id));
		return json({ ok: true });
	} catch (error) {
		return authErrorResponse(error);
	}
};
