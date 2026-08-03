import type { LayoutServerLoad } from './$types';
import { listUserWorkspaces } from '$lib/server/workspaces';

export const load = (async ({ locals }) => ({
	user: locals.user,
	sessionId: locals.sessionId,
	workspaces: locals.user ? await listUserWorkspaces(locals.user.id) : []
})) satisfies LayoutServerLoad;
