import type { LayoutServerLoad } from './$types';
import { ACTIVE_WORKSPACE_COOKIE, listUserWorkspaces } from '$lib/server/workspaces';

export const load = (async ({ locals, cookies }) => {
	const workspaces = locals.user ? await listUserWorkspaces(locals.user.id) : [];
	const selectedWorkspaceId = cookies.get(ACTIVE_WORKSPACE_COOKIE);
	const activeWorkspace = selectedWorkspaceId
		? (workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ??
			workspaces[0] ??
			null)
		: (workspaces[0] ?? null);

	return {
		user: locals.user,
		sessionId: locals.sessionId,
		workspaces,
		activeWorkspace
	};
}) satisfies LayoutServerLoad;
