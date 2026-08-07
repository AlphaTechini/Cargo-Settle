import type { RequestEvent } from '@sveltejs/kit';
import {
	requireBusinessRole,
	requireWorkspaceMember,
	type WorkspaceContext
} from '$lib/server/auth/authorization';
import { getShipperDashboardData } from './shipper-repository';

export async function requireShipperWorkspace(event: RequestEvent) {
	return requireBusinessRole(await requireWorkspaceMember(event), ['shipper']);
}

export async function getShipperDashboard(context: WorkspaceContext) {
	const shipperContext = requireBusinessRole(context, ['shipper']);
	return getShipperDashboardData(shipperContext.workspace.id, shipperContext.user.id);
}
