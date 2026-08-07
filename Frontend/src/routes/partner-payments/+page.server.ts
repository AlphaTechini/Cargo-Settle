import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AuthorizationError } from '$lib/server/auth/authorization';
import {
	getPartnerDashboard,
	requirePartnerWorkspace
} from '$lib/server/dashboard/partner-service';
import { getPartnerSettlements } from '$lib/server/settlements/service';

export const load: PageServerLoad = async (event) => {
	try {
		const context = await requirePartnerWorkspace(event);
		const [payments, dashboard] = await Promise.all([
			getPartnerSettlements(context),
			getPartnerDashboard(context)
		]);
		return { payments, dashboard };
	} catch (loadError) {
		if (loadError instanceof AuthorizationError) {
			if (loadError.status === 401) redirect(303, '/auth-login');
			error(loadError.status, loadError.message);
		}
		throw loadError;
	}
};
