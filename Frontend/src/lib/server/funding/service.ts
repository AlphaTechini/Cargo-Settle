import type { WorkspaceContext } from '$lib/server/auth/authorization';
import { requireBusinessRole } from '$lib/server/auth/authorization';
import type { ShipperFundingRequest } from '$lib/funding';
import { listShipperFundingIntents } from './repository';

export async function getShipperFundingRequests(
	context: WorkspaceContext,
	fundingIntentId?: string
): Promise<ShipperFundingRequest[]> {
	const shipperContext = requireBusinessRole(context, ['shipper']);
	const requests = await listShipperFundingIntents(
		shipperContext.workspace.id,
		shipperContext.user.id,
		fundingIntentId
	);
	return requests.map((request) => ({
		...request,
		createdAt: request.createdAt.toISOString(),
		confirmedAt: request.confirmedAt?.toISOString() ?? null
	}));
}
