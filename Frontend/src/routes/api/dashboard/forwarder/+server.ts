import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import {
	getForwarderDashboard,
	requireForwarderWorkspace
} from '$lib/server/dashboard/forwarder-service';

export const GET: RequestHandler = async (event) => {
	try {
		const context = await requireForwarderWorkspace(event);
		return json(await getForwarderDashboard(context));
	} catch (error) {
		return authErrorResponse(error);
	}
};
