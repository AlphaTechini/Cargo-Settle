import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { MetamaskConnectEVM } from '@metamask/connect-evm';
import {
	decodeFunctionResult,
	encodeFunctionData,
	getAddress,
	keccak256,
	parseUnits,
	stringToBytes,
	stringToHex,
	type Address,
	type Hex
} from 'viem';

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
	},
	{
		type: 'function',
		name: 'createShipment',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'shipmentId', type: 'bytes32' },
			{ name: 'shipper', type: 'address' },
			{ name: 'forwarder', type: 'address' }
		],
		outputs: []
	},
	{
		type: 'function',
		name: 'getShipment',
		stateMutability: 'view',
		inputs: [{ name: 'shipmentId', type: 'bytes32' }],
		outputs: [
			{ name: 'shipper', type: 'address' },
			{ name: 'forwarder', type: 'address' },
			{ name: 'createdAt', type: 'uint64' },
			{ name: 'outstandingObligations', type: 'uint256' },
			{ name: 'exists', type: 'bool' },
			{ name: 'cancelled', type: 'bool' },
			{ name: 'completed', type: 'bool' }
		]
	}
] as const;

const erc20Abi = [
	{
		type: 'function',
		name: 'approve',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'spender', type: 'address' },
			{ name: 'amount', type: 'uint256' }
		],
		outputs: [{ name: '', type: 'bool' }]
	},
	{
		type: 'function',
		name: 'allowance',
		stateMutability: 'view',
		inputs: [
			{ name: 'owner', type: 'address' },
			{ name: 'spender', type: 'address' }
		],
		outputs: [{ name: '', type: 'uint256' }]
	},
	{
		type: 'function',
		name: 'decimals',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'uint8' }]
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

export function toChainShipmentId(shipmentId: string) {
	return keccak256(stringToBytes(`cargosettle:shipment:${shipmentId}`));
}

export function encodeEscrowFundShipment(shipmentId: Hex, token: Address, amount: bigint) {
	return encodeFunctionData({
		abi: escrowAbi,
		functionName: 'fundShipment',
		args: [shipmentId, token, amount]
	});
}

export function encodeEscrowCreateShipment(shipmentId: Hex, shipper: Address, forwarder: Address) {
	return encodeFunctionData({
		abi: escrowAbi,
		functionName: 'createShipment',
		args: [shipmentId, shipper, forwarder]
	});
}

function getEscrowAddress() {
	const escrowAddress = env.PUBLIC_ARC_ESCROW_ADDRESS;
	if (!escrowAddress) throw new Error('PUBLIC_ARC_ESCROW_ADDRESS is not configured');
	return getAddress(escrowAddress);
}

function getTokenAddress(currency: 'usdc' | 'eurc') {
	const tokenAddress =
		currency === 'usdc' ? env.PUBLIC_ARC_USDC_ADDRESS : env.PUBLIC_ARC_EURC_ADDRESS;
	if (!tokenAddress)
		throw new Error(`PUBLIC_ARC_${currency.toUpperCase()}_ADDRESS is not configured`);
	return getAddress(tokenAddress);
}

async function sendArcTransaction(to: Address, data: Hex) {
	const current = getWalletSnapshot();
	if (!current.address || current.chainId !== ARC_TESTNET_CHAIN_ID_HEX) {
		throw new Error('Connect MetaMask to Arc Testnet before signing a transaction');
	}
	const client = await getWalletClient();
	return client.getProvider().request({
		method: 'eth_sendTransaction',
		params: [{ from: current.address, to, data }]
	}) as Promise<Hex>;
}

export async function sendEscrowTransaction(data: Hex) {
	return sendArcTransaction(getEscrowAddress(), data);
}

async function callArc(to: Address, data: Hex) {
	const client = await getWalletClient();
	return client.getProvider().request({
		method: 'eth_call',
		params: [{ to, data }, 'latest']
	}) as Promise<Hex>;
}

export async function waitForArcTransaction(txHash: Hex) {
	const client = await getWalletClient();
	for (let attempt = 0; attempt < 90; attempt += 1) {
		const receipt = (await client.getProvider().request({
			method: 'eth_getTransactionReceipt',
			params: [txHash]
		})) as { status?: Hex } | null;
		if (receipt) {
			if (receipt.status !== '0x1') throw new Error('The Arc transaction failed on-chain');
			return receipt;
		}
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
	throw new Error('Timed out waiting for the Arc transaction receipt');
}

export async function ensureEscrowShipment(input: {
	shipmentId: string;
	shipper: Address;
	forwarder: Address;
}) {
	const current = getWalletSnapshot();
	if (!current.address || current.address.toLowerCase() !== input.forwarder.toLowerCase()) {
		throw new Error('Connect the linked freight-forwarder wallet before registering this shipment');
	}
	const chainShipmentId = toChainShipmentId(input.shipmentId);
	const escrowAddress = getEscrowAddress();
	const data = encodeFunctionData({
		abi: escrowAbi,
		functionName: 'getShipment',
		args: [chainShipmentId]
	});
	const result = decodeFunctionResult({
		abi: escrowAbi,
		functionName: 'getShipment',
		data: await callArc(escrowAddress, data)
	});
	if (result[4]) {
		if (
			result[0].toLowerCase() !== input.shipper.toLowerCase() ||
			result[1].toLowerCase() !== input.forwarder.toLowerCase()
		) {
			throw new Error('The on-chain shipment is linked to different wallet addresses');
		}
		return { chainShipmentId, created: false, transactionHash: null };
	}

	const createData = encodeEscrowCreateShipment(chainShipmentId, input.shipper, input.forwarder);
	const transactionHash = await sendArcTransaction(escrowAddress, createData);
	await waitForArcTransaction(transactionHash);
	return { chainShipmentId, created: true, transactionHash };
}

export async function fundEscrowShipment(input: {
	shipmentId: string;
	currency: 'usdc' | 'eurc';
	amount: string;
}) {
	const current = getWalletSnapshot();
	if (!current.address) throw new Error('Connect the linked shipper wallet before funding');
	const token = getTokenAddress(input.currency);
	const escrowAddress = getEscrowAddress();
	const chainShipmentId = toChainShipmentId(input.shipmentId);
	const decimalsResult = await callArc(
		token,
		encodeFunctionData({ abi: erc20Abi, functionName: 'decimals', args: [] })
	);
	const decimals = Number(
		decodeFunctionResult({ abi: erc20Abi, functionName: 'decimals', data: decimalsResult })
	);
	const units = parseUnits(input.amount, decimals);
	const allowanceResult = await callArc(
		token,
		encodeFunctionData({
			abi: erc20Abi,
			functionName: 'allowance',
			args: [current.address, escrowAddress]
		})
	);
	const allowance = decodeFunctionResult({
		abi: erc20Abi,
		functionName: 'allowance',
		data: allowanceResult
	}) as bigint;
	let approvalTransactionHash: Hex | null = null;
	if (allowance < units) {
		const approvalData = encodeFunctionData({
			abi: erc20Abi,
			functionName: 'approve',
			args: [escrowAddress, units]
		});
		approvalTransactionHash = await sendArcTransaction(token, approvalData);
		await waitForArcTransaction(approvalTransactionHash);
	}

	const fundingData = encodeEscrowFundShipment(chainShipmentId, token, units);
	const transactionHash = await sendArcTransaction(escrowAddress, fundingData);
	await waitForArcTransaction(transactionHash);
	return { chainShipmentId, approvalTransactionHash, transactionHash };
}
