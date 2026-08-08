<script lang="ts">
	import { onMount } from 'svelte';
	import { ensureEscrowShipment } from '$lib/chain';

	let { shipmentId } = $props<{ shipmentId: string }>();
	let shipperWallet = $state<string | null>(null);
	let forwarderWallet = $state<string | null>(null);
	let loading = $state(true);
	let creating = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(() => {
		void loadWallets();
	});

	function shortAddress(address: string | null) {
		return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
	}

	async function loadWallets() {
		try {
			const response = await fetch(`/api/shipments/${shipmentId}/onchain`);
			const result = (await response.json()) as {
				shipperWallet?: string | null;
				forwarderWallet?: string | null;
				error?: string;
			};
			if (!response.ok) throw new Error(result.error ?? 'Unable to load linked wallets');
			shipperWallet = result.shipperWallet ?? null;
			forwarderWallet = result.forwarderWallet ?? null;
		} catch (requestError) {
			error =
				requestError instanceof Error ? requestError.message : 'Unable to load linked wallets';
		} finally {
			loading = false;
		}
	}

	async function createOnChainShipment() {
		if (!shipperWallet || !forwarderWallet) {
			error = 'Both the shipper and freight-forwarder must link an Arc wallet first.';
			return;
		}
		creating = true;
		error = '';
		success = '';
		try {
			const result = await ensureEscrowShipment({
				shipmentId,
				shipper: shipperWallet as `0x${string}`,
				forwarder: forwarderWallet as `0x${string}`
			});
			if (result.created && result.transactionHash) {
				const recordResponse = await fetch(`/api/shipments/${shipmentId}/onchain`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						transactionHash: result.transactionHash,
						chainShipmentId: result.chainShipmentId
					})
				});
				if (!recordResponse.ok)
					throw new Error('Shipment was created on-chain but could not be recorded locally');
				success = 'Shipment registered on Arc Testnet.';
			} else {
				success = 'Shipment is already registered on Arc Testnet.';
			}
		} catch (requestError) {
			error =
				requestError instanceof Error
					? requestError.message
					: 'Unable to register shipment on-chain';
		} finally {
			creating = false;
		}
	}
</script>

<div class="cs-card p-5">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<p class="text-xs font-extrabold tracking-wider text-purple-700 uppercase">Arc Testnet</p>
			<h3 class="mt-2 text-lg font-extrabold">Register shipment on-chain</h3>
			<p class="cs-muted mt-1 text-sm">
				The forwarder wallet must register the shipper and forwarder addresses before funding.
			</p>
		</div>
		<button
			class="cs-btn cs-btn-primary"
			disabled={loading || creating || !shipperWallet || !forwarderWallet}
			onclick={() => void createOnChainShipment()}
		>
			{creating ? 'Waiting for confirmation...' : 'Register shipment'}
		</button>
	</div>
	<div class="mt-4 grid gap-3 text-sm md:grid-cols-2">
		<div class="rounded-xl bg-slate-50 p-3">
			<span class="cs-muted block text-xs">Shipper wallet</span><b class="mt-1 block"
				>{loading ? 'Loading...' : shipperWallet ? shortAddress(shipperWallet) : 'Not linked'}</b
			>
		</div>
		<div class="rounded-xl bg-slate-50 p-3">
			<span class="cs-muted block text-xs">Forwarder wallet</span><b class="mt-1 block"
				>{loading
					? 'Loading...'
					: forwarderWallet
						? shortAddress(forwarderWallet)
						: 'Not linked'}</b
			>
		</div>
	</div>
	{#if error}<p class="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-900">{error}</p>{/if}
	{#if success}<p class="mt-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-900">{success}</p>{/if}
</div>
