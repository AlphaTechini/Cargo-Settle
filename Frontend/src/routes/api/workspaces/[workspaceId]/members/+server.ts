import { eq } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireWorkspaceMember } from '$lib/server/auth/authorization';
import { getDb } from '$lib/server/db';
import { users, workspaceMembers } from '$lib/server/db/schema';

export const GET: RequestHandler = async (event) => {
	try {
		const context = await requireWorkspaceMember(event, event.params.workspaceId);
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
			.where(eq(workspaceMembers.workspaceId, context.workspace.id));
		return json({ members });
	} catch (error) {
		return authErrorResponse(error);
	}
};
