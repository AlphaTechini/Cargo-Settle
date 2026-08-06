import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { MetamaskConnectEVM } from '@metamask/connect-evm';
import { encodeFunctionData, getAddress, stringToHex, type Address, type Hex } from 'viem';

export const ARC_TESTNET_CHAIN_ID = 5042002;
export const ARC_TESTNET_CHAIN_ID_HEX = '0x4cef52' as Hex;
export const ARC_TESTNET_RPC_URL = 'https://rpc.testnet.arc.io';
export const ARC_TESTNET_EXPLORER_URL = 'https://testnet.arcscan.app';

const arcChainConfiguration = {
	chainId: ARC_TESTNET_CHAIN_ID_HEX,
	chainName: 'Arc Testnet',
	nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
	rpcUrls: [ARC_TESTNET_RPC_URL],
	blockExplorerUrls: [ARC_TESTNET_EXPLORER_URL]
};

const escrowAbi = [
	{
		type: 'function',
		name: 'fundShipment',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'shipmentId', type: 'bytes32' },
			{ name: 'token', type: 'address' },
			{ name: 'amount', type: 'uint256' }
		],
		outputs: []
	}
] as const;

export type WalletSnapshot = {
	address: Address | null;
	chainId: Hex | null;
};

let clientPromise: Promise<MetamaskConnectEVM> | null = null;
let snapshot: WalletSnapshot = { address: null, chainId: null };
const listeners = new Set<(next: WalletSnapshot) => void>();

function notify(next: WalletSnapshot) {
	snapshot = next;
	for (const listener of listeners) listener(snapshot);
}

export function getWalletSnapshot() {
	return snapshot;
}

export function subscribeWallet(listener: (next: WalletSnapshot) => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export async function getWalletClient() {
	if (!browser) throw new Error('Wallet access is only available in the browser');
	if (!clientPromise) {
		clientPromise = import('@metamask/connect-evm').then(({ createEVMClient }) =>
			createEVMClient({
				dapp: { name: 'CargoSettle', url: window.location.origin },
				api: { supportedNetworks: { [ARC_TESTNET_CHAIN_ID_HEX]: ARC_TESTNET_RPC_URL } },
				ui: { preferExtension: true, showInstallModal: true },
				eventHandlers: {
					accountsChanged: (accounts) =>
						notify({ address: accounts[0] ?? null, chainId: snapshot.chainId }),
					chainChanged: (chainId) => notify({ address: snapshot.address, chainId }),
					disconnect: () => notify({ address: null, chainId: null })
				}
			})
		);
	}
	return clientPromise;
}

export async function connectArcWallet() {
	const client = await getWalletClient();
	const result = await client.connect({ chainIds: [ARC_TESTNET_CHAIN_ID_HEX] });
	if (result.chainId !== ARC_TESTNET_CHAIN_ID_HEX) {
		await client.switchChain({
			chainId: ARC_TESTNET_CHAIN_ID_HEX,
			chainConfiguration: arcChainConfiguration
		});
	}
	const address = getAddress(result.accounts[0]);
	notify({ address, chainId: ARC_TESTNET_CHAIN_ID_HEX });
	return { client, address, chainId: ARC_TESTNET_CHAIN_ID_HEX };
}

export async function linkConnectedWallet(address: Address, chainId: Hex) {
	const challengeResponse = await fetch('/api/wallet/challenge', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ address, chainId: Number.parseInt(chainId, 16) })
	});
	const challenge = (await challengeResponse.json()) as {
		id?: string;
		message?: string;
		error?: string;
	};
	if (!challengeResponse.ok || !challenge.id || !challenge.message) {
		throw new Error(challenge.error ?? 'Unable to create wallet link challenge');
	}

	const client = await getWalletClient();
	const signature = await client.getProvider().request({
		method: 'personal_sign',
		params: [stringToHex(challenge.message), address]
	});
	const linkResponse = await fetch('/api/wallet/link', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ challengeId: challenge.id, signature })
	});
	const linked = (await linkResponse.json()) as { address?: string; error?: string };
	if (!linkResponse.ok || !linked.address) throw new Error(linked.error ?? 'Unable to link wallet');
	return linked.address as Address;
}

export async function getLinkedWallet() {
	const response = await fetch('/api/wallet');
	if (!response.ok) return null;
	const result = (await response.json()) as {
		connections?: Array<{ network: string; address: Address }>;
	};
	return (
		result.connections?.find((connection) => connection.network === 'arc-testnet')?.address ?? null
	);
}

export async function disconnectArcWallet() {
	if (clientPromise) {
		const client = await clientPromise;
		await client.disconnect();
	}
	notify({ address: null, chainId: null });
}

export function encodeEscrowFundShipment(shipmentId: Hex, token: Address, amount: bigint) {
	return encodeFunctionData({
		abi: escrowAbi,
		functionName: 'fundShipment',
		args: [shipmentId, token, amount]
	});
}

export async function sendEscrowTransaction(data: Hex) {
	const current = getWalletSnapshot();
	if (!current.address || current.chainId !== ARC_TESTNET_CHAIN_ID_HEX) {
		throw new Error('Connect MetaMask to Arc Testnet before signing a transaction');
	}
	const escrowAddress = env.PUBLIC_ARC_ESCROW_ADDRESS;
	if (!escrowAddress) throw new Error('PUBLIC_ARC_ESCROW_ADDRESS is not configured');
	const client = await getWalletClient();
	return client.getProvider().request({
		method: 'eth_sendTransaction',
		params: [{ from: current.address, to: getAddress(escrowAddress), data }]
	});
}
