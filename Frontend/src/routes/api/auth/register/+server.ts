import { dev } from '$app/environment';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { parseRegistrationInput } from '$lib/server/auth/input';
import { registerUser } from '$lib/server/auth/service';
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from '$lib/server/auth/sessions';
import { ACTIVE_WORKSPACE_COOKIE } from '$lib/server/workspaces';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const input = parseRegistrationInput(await request.json());
		const result = await registerUser(input);
		cookies.set(SESSION_COOKIE, result.session.token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: SESSION_TTL_SECONDS
		});
		cookies.set(ACTIVE_WORKSPACE_COOKIE, result.workspace.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 24 * 30
		});
		return json(
			{ user: result.user, workspace: result.workspace, businessRole: result.businessRole },
			{ status: 201 }
		);
	} catch (error) {
		return authErrorResponse(error);
	}
};
