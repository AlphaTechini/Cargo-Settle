import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AuthorizationError, requireUser } from '$lib/server/auth/authorization';

export const load: PageServerLoad = async (event) => {
	try {
		requireUser(event);
		const selectedRole = event.url.searchParams.get('role');
		const role = selectedRole === 'partner' ? ('partner' as const) : ('shipper' as const);
		return { role };
	} catch (loadError) {
		if (loadError instanceof AuthorizationError) redirect(303, '/auth-login');
		error(401, 'Sign in to view account status');
	}
};
