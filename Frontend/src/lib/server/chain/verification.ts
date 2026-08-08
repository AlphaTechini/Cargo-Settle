import { getAddress, keccak256, parseUnits, stringToBytes } from 'viem';
import { env } from '$env/dynamic/public';

const ARC_TESTNET_RPC_URL = 'https://rpc.testnet.arc.io';
const ARC_TESTNET_CHAIN_ID = 5042002;
const shipmentCreatedTopic = keccak256(stringToBytes('ShipmentCreated(bytes32,address,address)'));
const shipmentFundedTopic = keccak256(
	stringToBytes('ShipmentFunded(bytes32,address,address,uint256)')
);

export class ChainVerificationError extends Error {
	constructor(
		message: string,
		public status = 400
	) {
		super(message);
	}
}

type ArcLog = { address?: string; topics?: string[]; data?: string };
type ArcReceipt = { status?: string; from?: string; to?: string; logs?: ArcLog[] };

async function rpc<T>(method: string, params: unknown[]) {
	const response = await fetch(ARC_TESTNET_RPC_URL, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params })
	});
	if (!response.ok) throw new ChainVerificationError('Arc RPC is unavailable', 502);
	const payload = (await response.json()) as { result?: T; error?: { message?: string } };
	if (payload.error || payload.result === undefined) {
		throw new ChainVerificationError(payload.error?.message ?? 'Arc RPC returned no result', 502);
	}
	return payload.result;
}

function shipmentChainId(shipmentId: string) {
	return keccak256(stringToBytes(`cargosettle:shipment:${shipmentId}`));
}

function topicAddress(value: string | undefined) {
	if (!value || value.length < 42) throw new ChainVerificationError('Arc event address is invalid');
	return getAddress(`0x${value.slice(-40)}`).toLowerCase();
}

function requiredAddress(value: string | undefined, name: string) {
	if (!value) throw new ChainVerificationError(`${name} is not configured`, 500);
	return getAddress(value).toLowerCase();
}

function tokenAddress(currency: 'usdc' | 'eurc') {
	return requiredAddress(
		currency === 'usdc' ? env.PUBLIC_ARC_USDC_ADDRESS : env.PUBLIC_ARC_EURC_ADDRESS,
		`PUBLIC_ARC_${currency.toUpperCase()}_ADDRESS`
	);
}

async function receiptFor(transactionHash: string) {
	const receipt = await rpc<ArcReceipt | null>('eth_getTransactionReceipt', [transactionHash]);
	if (!receipt) throw new ChainVerificationError('Arc transaction is not confirmed yet', 409);
	if (receipt.status !== '0x1')
		throw new ChainVerificationError('Arc transaction failed on-chain', 400);
	return receipt;
}

export async function verifyShipmentCreatedReceipt(input: {
	transactionHash: string;
	shipmentId: string;
	shipperWallet: string;
	forwarderWallet: string;
}) {
	const escrowAddress = requiredAddress(env.PUBLIC_ARC_ESCROW_ADDRESS, 'PUBLIC_ARC_ESCROW_ADDRESS');
	const receipt = await receiptFor(input.transactionHash);
	if (receipt.to?.toLowerCase() !== escrowAddress)
		throw new ChainVerificationError('Transaction target is not the escrow contract');
	if (receipt.from?.toLowerCase() !== input.forwarderWallet.toLowerCase()) {
		throw new ChainVerificationError(
			'Transaction sender does not match the linked forwarder wallet'
		);
	}
	const chainId = shipmentChainId(input.shipmentId).toLowerCase();
	const log = receipt.logs?.find(
		(candidate) =>
			candidate.address?.toLowerCase() === escrowAddress &&
			candidate.topics?.[0]?.toLowerCase() === shipmentCreatedTopic &&
			candidate.topics?.[1]?.toLowerCase() === chainId
	);
	if (
		!log ||
		topicAddress(log.topics?.[2]) !== input.shipperWallet.toLowerCase() ||
		topicAddress(log.topics?.[3]) !== input.forwarderWallet.toLowerCase()
	) {
		throw new ChainVerificationError('ShipmentCreated event does not match this shipment');
	}
	return { chainShipmentId: chainId, chainId: ARC_TESTNET_CHAIN_ID };
}

export async function verifyShipmentFundedReceipt(input: {
	transactionHash: string;
	shipmentId: string;
	currency: 'usdc' | 'eurc';
	amount: string;
	funderWallet: string;
}) {
	const escrowAddress = requiredAddress(env.PUBLIC_ARC_ESCROW_ADDRESS, 'PUBLIC_ARC_ESCROW_ADDRESS');
	const expectedToken = tokenAddress(input.currency);
	const receipt = await receiptFor(input.transactionHash);
	if (receipt.to?.toLowerCase() !== escrowAddress)
		throw new ChainVerificationError('Transaction target is not the escrow contract');
	if (receipt.from?.toLowerCase() !== input.funderWallet.toLowerCase()) {
		throw new ChainVerificationError('Transaction sender does not match the linked shipper wallet');
	}
	const chainId = shipmentChainId(input.shipmentId).toLowerCase();
	const log = receipt.logs?.find(
		(candidate) =>
			candidate.address?.toLowerCase() === escrowAddress &&
			candidate.topics?.[0]?.toLowerCase() === shipmentFundedTopic &&
			candidate.topics?.[1]?.toLowerCase() === chainId
	);
	if (
		!log ||
		topicAddress(log.topics?.[2]) !== input.funderWallet.toLowerCase() ||
		topicAddress(log.topics?.[3]) !== expectedToken
	) {
		throw new ChainVerificationError('ShipmentFunded event does not match this funding request');
	}
	const decimalsHex = await rpc<string>('eth_call', [
		{
			to: expectedToken,
			data: '0x313ce567'
		},
		'latest'
	]);
	const expectedAmount = parseUnits(input.amount, Number(BigInt(decimalsHex)));
	if (BigInt(log.data ?? '0x0') !== expectedAmount) {
		throw new ChainVerificationError('ShipmentFunded amount does not match the funding request');
	}
	return { chainShipmentId: chainId, chainId: ARC_TESTNET_CHAIN_ID };
}
