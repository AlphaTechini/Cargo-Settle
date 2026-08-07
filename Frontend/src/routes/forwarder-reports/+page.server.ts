import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AuthorizationError } from '$lib/server/auth/authorization';
import {
	getForwarderDashboard,
	requireForwarderWorkspace
} from '$lib/server/dashboard/forwarder-service';

export const load: PageServerLoad = async (event) => {
	try {
		const context = await requireForwarderWorkspace(event);
		return { dashboard: await getForwarderDashboard(context) };
	} catch (loadError) {
		if (loadError instanceof AuthorizationError) {
			if (loadError.status === 401) redirect(303, '/auth-login');
			error(loadError.status, loadError.message);
		}
		throw loadError;
	}
};
