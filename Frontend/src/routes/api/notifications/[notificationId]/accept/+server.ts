import { dev } from '$app/environment';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireUser } from '$lib/server/auth/authorization';
import { ACTIVE_WORKSPACE_COOKIE } from '$lib/server/workspaces';
import { acceptInvitationNotification } from '$lib/server/notifications/service';

export const POST: RequestHandler = async (event) => {
	try {
		const user = requireUser(event);
		const workspace = await acceptInvitationNotification(
			user.id,
			user.email,
			event.params.notificationId ?? ''
		);
		event.cookies.set(ACTIVE_WORKSPACE_COOKIE, workspace.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 24 * 30
		});
		return json({ workspace });
	} catch (error) {
		return authErrorResponse(error);
	}
};
