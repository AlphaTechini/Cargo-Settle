import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE, readSession } from '$lib/server/auth/sessions';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.sessionId = null;

	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		const session = await readSession(token);
		if (session) {
			event.locals.user = session.user;
			event.locals.sessionId = session.sessionId;
		} else {
			event.cookies.delete(SESSION_COOKIE, { path: '/' });
		}
	}

	return resolve(event);
};
