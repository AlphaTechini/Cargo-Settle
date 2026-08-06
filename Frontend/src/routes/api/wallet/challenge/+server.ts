import { json, type RequestHandler } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth/authorization';
import { authErrorResponse } from '$lib/server/auth/http';
import { WalletServiceError, createWalletChallenge } from '$lib/server/wallets';

export const POST: RequestHandler = async (event) => {
	try {
		const user = requireUser(event);
		let body: { address?: unknown; chainId?: unknown };
		try {
			body = (await event.request.json()) as { address?: unknown; chainId?: unknown };
		} catch {
			throw new WalletServiceError('Request body must be valid JSON', 400);
		}
		if (typeof body.address !== 'string' || typeof body.chainId !== 'number') {
			throw new WalletServiceError('Wallet address and chain ID are required', 400);
		}
		return json(await createWalletChallenge(user.id, body.address, body.chainId));
	} catch (error) {
		return authErrorResponse(error);
	}
};
