import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import {
	getShipperDashboard,
	requireShipperWorkspace
} from '$lib/server/dashboard/shipper-service';

export const GET: RequestHandler = async (event) => {
	try {
		const context = await requireShipperWorkspace(event);
		return json(await getShipperDashboard(context));
	} catch (error) {
		return authErrorResponse(error);
	}
};
