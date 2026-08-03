import { eq } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireAccessRole, requireWorkspaceMember } from '$lib/server/auth/authorization';
import { getDb } from '$lib/server/db';
import { workspaces } from '$lib/server/db/schema';

export const PATCH: RequestHandler = async (event) => {
	try {
		const context = requireAccessRole(
			await requireWorkspaceMember(event, event.params.workspaceId),
			['owner', 'admin']
		);
		const body = (await event.request.json()) as { name?: unknown };
		const name = typeof body.name === 'string' ? body.name.trim() : '';
		if (!name) return json({ error: 'Workspace name is required' }, { status: 400 });
		const db = getDb();
		const [workspace] = await db
			.update(workspaces)
			.set({ name, updatedAt: new Date() })
			.where(eq(workspaces.id, context.workspace.id))
			.returning({ id: workspaces.id, name: workspaces.name, slug: workspaces.slug });
		return json({ workspace });
	} catch (error) {
		return authErrorResponse(error);
	}
};
