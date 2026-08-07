import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AuthorizationError } from '$lib/server/auth/authorization';
import { requireShipperWorkspace } from '$lib/server/dashboard/shipper-service';
import { getShipperFundingRequests } from '$lib/server/funding/service';

export const load: PageServerLoad = async (event) => {
	try {
		const context = await requireShipperWorkspace(event);
		const fundingIntentId = event.url.searchParams.get('fundingIntentId') ?? undefined;
		return { funding: { requests: await getShipperFundingRequests(context, fundingIntentId) } };
	} catch (loadError) {
		if (loadError instanceof AuthorizationError) {
			if (loadError.status === 401) redirect(303, '/auth-login');
			error(loadError.status, loadError.message);
		}
		throw loadError;
	}
};
