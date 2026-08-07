import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireShipperWorkspace } from '$lib/server/dashboard/shipper-service';
import { getShipperFundingRequests } from '$lib/server/funding/service';

export const GET: RequestHandler = async (event) => {
	try {
		const context = await requireShipperWorkspace(event);
		const fundingIntentId =
			new URL(event.request.url).searchParams.get('fundingIntentId') ?? undefined;
		return json({ requests: await getShipperFundingRequests(context, fundingIntentId) });
	} catch (error) {
		return authErrorResponse(error);
	}
};
