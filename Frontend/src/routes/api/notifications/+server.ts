import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireUser } from '$lib/server/auth/authorization';
import { listUserNotifications } from '$lib/server/notifications/service';

export const GET: RequestHandler = async (event) => {
	try {
		const user = requireUser(event);
		return json({ notifications: await listUserNotifications(user.id, user.email) });
	} catch (error) {
		return authErrorResponse(error);
	}
};
