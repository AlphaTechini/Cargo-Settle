import { dev } from '$app/environment';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { parseLoginInput } from '$lib/server/auth/input';
import { loginUser } from '$lib/server/auth/service';
import {
	SESSION_COOKIE,
	SESSION_TTL_SECONDS,
	SESSION_TTL_SHORT_SECONDS
} from '$lib/server/auth/sessions';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const input = parseLoginInput(await request.json());
		const result = await loginUser(input);
		const rememberMe = input.rememberMe;
		cookies.set(SESSION_COOKIE, result.session.token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: rememberMe ? SESSION_TTL_SECONDS : SESSION_TTL_SHORT_SECONDS
		});
		return json({ user: result.user, businessRole: result.businessRole });
	} catch (error) {
		return authErrorResponse(error);
	}
};
