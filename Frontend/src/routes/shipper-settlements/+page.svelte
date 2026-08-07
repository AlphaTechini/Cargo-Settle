<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import SettlementRow from '$lib/components/SettlementRow.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import { formatCurrencyTotals } from '$lib/dashboard';
	import { downloadCsv } from '$lib/utils';

	let { data }: { data: PageData } = $props();
	let rows = $derived(data.settlements.rows);

	function exportSettlements() {
		downloadCsv('cargosettle-shipper-settlements.csv', [
			['Date', 'Shipment', 'Forwarder', 'Amount', 'Currency', 'Status'],
			...rows.map((row) => [
				row.confirmedAt ?? row.createdAt,
				row.shipment.reference,
				row.forwarder,
				row.amount,
				row.currency.toUpperCase(),
				row.status
			])
		]);
	}
</script>

<AppShell
	title="Settlement history"
	subtitle="See how shipment funding was distributed"
	active="settlements"
	role="shipper"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="mb-5 grid gap-4 md:grid-cols-3">
			<MetricCard
				label="Funded this year"
				value={formatCurrencyTotals(data.settlements.summary.fundedTotals)}
				note={data.settlements.summary.fundedTotals.length
					? 'Confirmed funding intents'
					: 'No confirmed funding this year'}
				icon="wallet"
			/>
			<MetricCard
				label="Allocated"
				value={formatCurrencyTotals(data.settlements.summary.allocatedTotals)}
				note={data.settlements.summary.allocatedTotals.length
					? 'Confirmed settlements'
					: 'No confirmed settlements this year'}
				icon="receipt"
			/>
			<MetricCard
				label="Settlement records"
				value={String(rows.length)}
				note={rows.length ? 'Records in this workspace' : 'No settlement records yet'}
				icon="check-circle"
			/>
		</div>
		<div class="mb-5 flex justify-between gap-3">
			<button class="cs-btn cs-btn-secondary" onclick={exportSettlements}
				><Icon name="download" size={16} />Export</button
			>
		</div>
		<div class="cs-card overflow-x-auto">
			<table class="cs-table min-w-[950px]">
				<thead
					><tr><th>Date</th><th>Shipment</th><th>Forwarder</th><th>Amount</th><th>Status</th></tr
					></thead
				><tbody>
					{#if rows.length === 0}
						<tr><td colspan="5" class="cs-muted p-8 text-center">No settlement records yet.</td></tr
						>
					{:else}
						{#each rows as row (row.id)}<SettlementRow {row} />{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</section>
</AppShell>
