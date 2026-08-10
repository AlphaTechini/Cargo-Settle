import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireAccessRole, requireWorkspaceMember } from '$lib/server/auth/authorization';
import { requestShipmentFunding } from '$lib/server/funding/service';
import { parseFundingRequest } from '$lib/server/funding/validation';

export const POST: RequestHandler = async (event) => {
	try {
		const context = await requireWorkspaceMember(event);
		const authorizedContext = requireAccessRole(context, ['owner', 'admin', 'operator']);
		const shipmentId = event.params.shipmentId;
		if (!shipmentId) return json({ error: 'shipmentId is required' }, { status: 400 });
		const input = parseFundingRequest(await event.request.json());
		return json(await requestShipmentFunding(authorizedContext, shipmentId, input));
	} catch (error) {
		return authErrorResponse(error);
	}
};
