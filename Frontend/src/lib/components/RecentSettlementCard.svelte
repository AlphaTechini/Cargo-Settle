<script lang="ts">
	import type { DashboardSettlement } from '$lib/dashboard';
	import { formatCurrencyAmount } from '$lib/dashboard';

	let { settlement } = $props<{ settlement: DashboardSettlement | null }>();

	function formatDate(value: string | null) {
		if (!value) return '';
		return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
			new Date(value)
		);
	}
</script>

<div class="cs-card p-5">
	<h3 class="font-extrabold">Recent settlement</h3>
	{#if settlement}
		<p class="mt-4 text-2xl font-extrabold">
			{formatCurrencyAmount(settlement.amount, settlement.currency)}
		</p>
		<p class="cs-muted mt-1 text-xs">
			{settlement.shipment.reference} · {settlement.shipment.origin} -> {settlement.shipment
				.destination}
		</p>
		<p class="cs-muted mt-3 text-xs">Confirmed {formatDate(settlement.confirmedAt)}</p>
	{:else}
		<p class="cs-muted mt-4 text-sm">No confirmed settlements yet.</p>
	{/if}
</div>
