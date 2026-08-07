import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireShipperWorkspace } from '$lib/server/dashboard/shipper-service';
import { getShipperSettlements } from '$lib/server/settlements/service';

export const GET: RequestHandler = async (event) => {
	try {
		const context = await requireShipperWorkspace(event);
		return json(await getShipperSettlements(context));
	} catch (error) {
		return authErrorResponse(error);
	}
};
