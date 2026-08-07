import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AuthorizationError } from '$lib/server/auth/authorization';
import { requireShipperWorkspace } from '$lib/server/dashboard/shipper-service';
import { getShipperSettlements } from '$lib/server/settlements/service';

export const load: PageServerLoad = async (event) => {
	try {
		const context = await requireShipperWorkspace(event);
		return { settlements: await getShipperSettlements(context) };
	} catch (loadError) {
		if (loadError instanceof AuthorizationError) {
			if (loadError.status === 401) redirect(303, '/auth-login');
			error(loadError.status, loadError.message);
		}
		throw loadError;
	}
};
