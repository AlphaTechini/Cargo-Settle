<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import RoleSettlementRow from '$lib/components/RoleSettlementRow.svelte';
	import { formatCurrencyAmount, formatCurrencyTotals } from '$lib/dashboard';
	import { downloadCsv } from '$lib/utils';

	let { data }: { data: PageData } = $props();
	let query = $state('');
	let filtered = $derived(
		data.payments.rows.filter((row) =>
			`${row.id} ${row.shipment.reference} ${row.recipient}`
				.toLowerCase()
				.includes(query.toLowerCase())
		)
	);

	function exportPayments() {
		downloadCsv('cargosettle-partner-payments.csv', [
			['Date', 'Settlement', 'Shipment', 'Recipient', 'Amount', 'Status'],
			...data.payments.rows.map((row) => [
				row.confirmedAt ?? row.createdAt,
				row.id,
				row.shipment.reference,
				row.recipient,
				`${row.amount} ${row.currency.toUpperCase()}`,
				row.status
			])
		]);
	}
</script>

<AppShell
	title="Payments"
	subtitle="Settlement history and receivable activity"
	active="payments"
	role="partner"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="mb-5 grid gap-4 md:grid-cols-3">
			<MetricCard
				label="Received this month"
				value={formatCurrencyTotals(data.payments.settledThisMonth)}
				note="Confirmed settlements"
				icon="dollar"
			/>
			<MetricCard
				label="Processing"
				value={formatCurrencyTotals(data.payments.processing)}
				note="Pending or submitted"
				icon="clock"
			/>
			<MetricCard
				label="Next scheduled"
				value={data.dashboard.upcomingObligations[0]
					? formatCurrencyAmount(
							data.dashboard.upcomingObligations[0].amount,
							data.dashboard.upcomingObligations[0].currency
						)
					: '0'}
				note={data.dashboard.upcomingObligations[0]
					? data.dashboard.upcomingObligations[0].shipmentReference
					: 'No upcoming obligation'}
				icon="receipt"
			/>
		</div>
		<div class="mb-5 flex flex-wrap justify-between gap-3">
			<div class="relative">
				<Icon
					name="search"
					size={16}
					className="absolute top-1/2 left-3 -translate-y-1/2 cs-muted"
				/>
				<input class="cs-input !w-[300px] !pl-9" bind:value={query} placeholder="Search payments" />
			</div>
			<button class="cs-btn cs-btn-secondary" onclick={exportPayments}>
				<Icon name="download" size={16} />Export
			</button>
		</div>
		<div class="cs-card overflow-x-auto">
			<table class="cs-table min-w-[950px]">
				<thead
					><tr><th>Date</th><th>Shipment</th><th>Recipient</th><th>Amount</th><th>Status</th></tr
					></thead
				>
				<tbody>
					{#if filtered.length === 0}
						<tr><td colspan="5" class="cs-muted p-8 text-center">No payment records found.</td></tr>
					{:else}
						{#each filtered as row (row.id)}<RoleSettlementRow {row} />{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</section>
</AppShell>
