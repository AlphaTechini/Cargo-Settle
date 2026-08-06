import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { getAddress, recoverMessageAddress } from 'viem';
import { getDb } from '$lib/server/db';
import { walletConnections, walletLinkChallenges } from '$lib/server/db/schema';

export const ARC_TESTNET_NETWORK = 'arc-testnet';
export const ARC_TESTNET_CHAIN_ID = 5042002;
export const WALLET_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export class WalletServiceError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
	}
}

function normalizeAddress(address: string) {
	try {
		return getAddress(address).toLowerCase();
	} catch {
		throw new WalletServiceError('Enter a valid EVM wallet address', 400);
	}
}

function hashNonce(nonce: string) {
	return createHash('sha256').update(nonce).digest('hex');
}

export function normalizeWalletInput(address: string, chainId: number) {
	if (chainId !== ARC_TESTNET_CHAIN_ID) {
		throw new WalletServiceError('Switch MetaMask to Arc Testnet before linking this wallet', 400);
	}
	return { address: normalizeAddress(address), network: ARC_TESTNET_NETWORK, chainId };
}

export async function createWalletChallenge(userId: string, addressInput: string, chainId: number) {
	const { address, network } = normalizeWalletInput(addressInput, chainId);
	const nonce = randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + WALLET_CHALLENGE_TTL_MS);
	const issuedAt = new Date();
	const message = [
		'CargoSettle wallet link',
		'',
		`Address: ${getAddress(address)}`,
		`Network: Arc Testnet`,
		`Chain ID: ${chainId}`,
		`Nonce: ${nonce}`,
		`Issued at: ${issuedAt.toISOString()}`,
		`Expires at: ${expiresAt.toISOString()}`
	].join('\n');

	const db = getDb();
	const [challenge] = await db
		.insert(walletLinkChallenges)
		.values({
			userId,
			network,
			chainId,
			address,
			message,
			nonceHash: hashNonce(nonce),
			expiresAt
		})
		.returning({
			id: walletLinkChallenges.id,
			message: walletLinkChallenges.message,
			expiresAt: walletLinkChallenges.expiresAt
		});

	return challenge;
}

export async function linkWallet(userId: string, challengeId: string, signature: string) {
	if (!signature.startsWith('0x')) throw new WalletServiceError('Invalid wallet signature', 400);

	const db = getDb();
	const [challenge] = await db
		.select()
		.from(walletLinkChallenges)
		.where(
			and(
				eq(walletLinkChallenges.id, challengeId),
				eq(walletLinkChallenges.userId, userId),
				isNull(walletLinkChallenges.consumedAt),
				gt(walletLinkChallenges.expiresAt, new Date())
			)
		)
		.limit(1);

	if (!challenge) throw new WalletServiceError('Wallet link challenge is expired or invalid', 400);

	let recoveredAddress: string;
	try {
		recoveredAddress = (
			await recoverMessageAddress({
				message: challenge.message,
				signature: signature as `0x${string}`
			})
		).toLowerCase();
	} catch {
		throw new WalletServiceError('Wallet signature could not be verified', 400);
	}

	if (recoveredAddress !== challenge.address) {
		throw new WalletServiceError('Wallet signature does not match the requested address', 400);
	}

	const existingAddress = await db
		.select({ userId: walletConnections.userId })
		.from(walletConnections)
		.where(
			and(
				eq(walletConnections.network, challenge.network),
				eq(walletConnections.address, challenge.address)
			)
		)
		.limit(1);
	if (existingAddress[0] && existingAddress[0].userId !== userId) {
		throw new WalletServiceError('That wallet is already linked to another CargoSettle user', 409);
	}

	await db.transaction(async (tx) => {
		const [currentConnection] = await tx
			.select({ id: walletConnections.id })
			.from(walletConnections)
			.where(
				and(eq(walletConnections.userId, userId), eq(walletConnections.network, challenge.network))
			)
			.limit(1);

		if (currentConnection) {
			await tx
				.update(walletConnections)
				.set({
					address: challenge.address,
					chainId: challenge.chainId,
					verifiedAt: new Date(),
					updatedAt: new Date()
				})
				.where(eq(walletConnections.id, currentConnection.id));
		} else {
			await tx.insert(walletConnections).values({
				userId,
				network: challenge.network,
				chainId: challenge.chainId,
				address: challenge.address,
				verifiedAt: new Date()
			});
		}

		await tx
			.update(walletLinkChallenges)
			.set({ consumedAt: new Date() })
			.where(eq(walletLinkChallenges.id, challenge.id));
	});

	return { network: challenge.network, chainId: challenge.chainId, address: challenge.address };
}

export async function listWalletConnections(userId: string) {
	const db = getDb();
	return db
		.select({
			id: walletConnections.id,
			network: walletConnections.network,
			chainId: walletConnections.chainId,
			address: walletConnections.address,
			verifiedAt: walletConnections.verifiedAt
		})
		.from(walletConnections)
		.where(eq(walletConnections.userId, userId));
}
