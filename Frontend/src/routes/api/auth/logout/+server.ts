import { json, type RequestHandler } from '@sveltejs/kit';
import { SESSION_COOKIE, revokeSession } from '$lib/server/auth/sessions';

export const POST: RequestHandler = async ({ cookies }) => {
	const token = cookies.get(SESSION_COOKIE);
	if (token) await revokeSession(token);
	cookies.delete(SESSION_COOKIE, { path: '/' });
	return json({ ok: true });
};
