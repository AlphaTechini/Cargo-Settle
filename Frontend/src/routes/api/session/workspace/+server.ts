import { dev } from '$app/environment';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireUser, requireWorkspaceMember } from '$lib/server/auth/authorization';
import { ACTIVE_WORKSPACE_COOKIE } from '$lib/server/workspaces';

export const POST: RequestHandler = async (event) => {
	try {
		requireUser(event);
		const body = (await event.request.json()) as { workspaceId?: unknown };
		if (typeof body.workspaceId !== 'string' || body.workspaceId.length === 0) {
			return json({ error: 'workspaceId is required' }, { status: 400 });
		}
		const context = await requireWorkspaceMember(event, body.workspaceId);
		event.cookies.set(ACTIVE_WORKSPACE_COOKIE, context.workspace.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 24 * 30
		});
		return json({ workspace: context.workspace });
	} catch (error) {
		return authErrorResponse(error);
	}
};
