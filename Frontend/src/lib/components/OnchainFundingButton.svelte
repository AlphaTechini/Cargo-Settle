<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ARC_TESTNET_EXPLORER_URL, fundEscrowShipment } from '$lib/chain';
	import type { DashboardCurrency } from '$lib/dashboard';

	let {
		fundingIntentId,
		shipmentId,
		amount,
		currency,
		enabled = true
	} = $props<{
		fundingIntentId: string;
		shipmentId: string;
		amount: string;
		currency: DashboardCurrency;
		enabled?: boolean;
	}>();
	let loading = $state(false);
	let error = $state('');
	let transactionHash = $state('');

	async function fund() {
		loading = true;
		error = '';
		transactionHash = '';
		try {
			const result = await fundEscrowShipment({ shipmentId, currency, amount });
			const response = await fetch(`/api/funding-intents/${fundingIntentId}/onchain`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					transactionHash: result.transactionHash,
					approvalTransactionHash: result.approvalTransactionHash
				})
			});
			const body = (await response.json()) as { error?: string };
			if (!response.ok) throw new Error(body.error ?? 'Unable to record the confirmed funding');
			transactionHash = result.transactionHash;
			await invalidateAll();
		} catch (requestError) {
			error = requestError instanceof Error ? requestError.message : 'Unable to fund shipment';
		} finally {
			loading = false;
		}
	}
</script>

<div class="mt-5 rounded-xl border border-teal-100 bg-teal-50/50 p-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<p class="text-sm font-extrabold">Fund on Arc Testnet</p>
			<p class="cs-muted mt-1 text-xs">
				Approve the token and fund the registered on-chain shipment.
			</p>
		</div>
		<button
			class="cs-btn cs-btn-primary"
			disabled={!enabled || loading}
			onclick={() => void fund()}
		>
			{loading ? 'Waiting for wallet...' : 'Fund shipment'}
		</button>
	</div>
	{#if transactionHash}<a
			class="mt-3 block text-xs font-bold text-teal-700"
			href={`${ARC_TESTNET_EXPLORER_URL}/tx/${transactionHash}`}
			target="_blank"
			rel="noreferrer">View funding transaction</a
		>{/if}
	{#if error}<p class="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-900">{error}</p>{/if}
</div>
