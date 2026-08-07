import type { RequestEvent } from '@sveltejs/kit';
import {
	requireBusinessRole,
	requireWorkspaceMember,
	type WorkspaceContext
} from '$lib/server/auth/authorization';
import { listWalletConnections } from '$lib/server/wallets';
import { getPartnerDashboardData } from './partner-repository';

export async function requirePartnerWorkspace(event: RequestEvent) {
	return requireBusinessRole(await requireWorkspaceMember(event), ['logistics_partner']);
}

export async function getPartnerDashboard(context: WorkspaceContext) {
	const partnerContext = requireBusinessRole(context, ['logistics_partner']);
	const [dashboard, wallets] = await Promise.all([
		getPartnerDashboardData(partnerContext.workspace.id, partnerContext.user.id),
		listWalletConnections(partnerContext.user.id)
	]);
	return {
		...dashboard,
		wallets: wallets.map((wallet) => ({
			id: wallet.id,
			network: wallet.network,
			address: wallet.address,
			verifiedAt: wallet.verifiedAt.toISOString()
		}))
	};
}
