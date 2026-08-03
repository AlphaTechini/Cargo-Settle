import { dev } from '$app/environment';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { parseLoginInput } from '$lib/server/auth/input';
import { loginUser } from '$lib/server/auth/service';
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from '$lib/server/auth/sessions';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const result = await loginUser(parseLoginInput(await request.json()));
		cookies.set(SESSION_COOKIE, result.session.token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: SESSION_TTL_SECONDS
		});
		return json({ user: result.user });
	} catch (error) {
		return authErrorResponse(error);
	}
};
