import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import {
	getPartnerDashboard,
	requirePartnerWorkspace
} from '$lib/server/dashboard/partner-service';

export const GET: RequestHandler = async (event) => {
	try {
		const context = await requirePartnerWorkspace(event);
		return json(await getPartnerDashboard(context));
	} catch (error) {
		return authErrorResponse(error);
	}
};
