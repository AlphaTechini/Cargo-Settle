import { json, type RequestHandler } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth/authorization';
import { authErrorResponse } from '$lib/server/auth/http';
import { WalletServiceError, linkWallet } from '$lib/server/wallets';

export const POST: RequestHandler = async (event) => {
	try {
		const user = requireUser(event);
		let body: { challengeId?: unknown; signature?: unknown };
		try {
			body = (await event.request.json()) as { challengeId?: unknown; signature?: unknown };
		} catch {
			throw new WalletServiceError('Request body must be valid JSON', 400);
		}
		if (typeof body.challengeId !== 'string' || typeof body.signature !== 'string') {
			throw new WalletServiceError('Wallet challenge and signature are required', 400);
		}
		return json(await linkWallet(user.id, body.challengeId, body.signature));
	} catch (error) {
		return authErrorResponse(error);
	}
};
