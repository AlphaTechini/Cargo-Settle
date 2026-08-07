import type { RequestEvent } from '@sveltejs/kit';
import {
	requireBusinessRole,
	requireWorkspaceMember,
	type WorkspaceContext
} from '$lib/server/auth/authorization';
import { getForwarderDashboardData } from './forwarder-repository';

export async function requireForwarderWorkspace(event: RequestEvent) {
	return requireBusinessRole(await requireWorkspaceMember(event), ['freight_forwarder']);
}

export async function getForwarderDashboard(context: WorkspaceContext) {
	const forwarderContext = requireBusinessRole(context, ['freight_forwarder']);
	return getForwarderDashboardData(forwarderContext.workspace.id);
}
