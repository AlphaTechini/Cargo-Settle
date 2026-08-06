import { json, type RequestHandler } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth/authorization';
import { authErrorResponse } from '$lib/server/auth/http';
import { listWalletConnections } from '$lib/server/wallets';

export const GET: RequestHandler = async (event) => {
	try {
		const user = requireUser(event);
		return json({ connections: await listWalletConnections(user.id) });
	} catch (error) {
		return authErrorResponse(error);
	}
};
