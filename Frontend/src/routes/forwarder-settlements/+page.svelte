<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import RoleSettlementRow from '$lib/components/RoleSettlementRow.svelte';
	import { formatCurrencyTotals } from '$lib/dashboard';
	import { downloadCsv } from '$lib/utils';

	let { data }: { data: PageData } = $props();
	let query = $state('');
	let filtered = $derived(
		data.settlements.rows.filter((row) =>
			`${row.id} ${row.shipment.reference} ${row.recipient}`
				.toLowerCase()
				.includes(query.toLowerCase())
		)
	);

	function exportLedger() {
		downloadCsv('cargosettle-settlement-ledger.csv', [
			['Date', 'Settlement', 'Shipment', 'Recipient', 'Amount', 'Status'],
			...data.settlements.rows.map((row) => [
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
	title="Settlements"
	subtitle="Audit every shipment-linked payment recorded in this workspace"
	active="settlements"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="mb-5 grid gap-4 md:grid-cols-4">
			<MetricCard
				label="Settled this month"
				value={formatCurrencyTotals(data.settlements.settledThisMonth)}
				note="Confirmed transactions"
				icon="dollar"
			/>
			<MetricCard
				label="Processing"
				value={formatCurrencyTotals(data.settlements.processing)}
				note="Pending or submitted"
				icon="clock"
			/>
			<MetricCard
				label="Failed"
				value={formatCurrencyTotals(data.settlements.failed)}
				note={data.settlements.failed.length ? 'Requires review' : 'No failed settlements'}
				icon="alert"
			/>
			<MetricCard
				label="Average confirmation"
				value={data.settlements.averageConfirmationSeconds === null
					? '0'
					: `${data.settlements.averageConfirmationSeconds}s`}
				note={data.settlements.averageConfirmationSeconds === null
					? 'No confirmed timing records'
					: 'Created to confirmation'}
				icon="check-circle"
			/>
		</div>
		<div class="mb-5 flex flex-wrap justify-between gap-3">
			<div class="relative">
				<Icon
					name="search"
					size={16}
					className="absolute top-1/2 left-3 -translate-y-1/2 cs-muted"
				/>
				<input
					class="cs-input !w-[300px] !pl-9"
					bind:value={query}
					placeholder="Search settlements"
				/>
			</div>
			<button class="cs-btn cs-btn-secondary" onclick={exportLedger}>
				<Icon name="download" size={16} />Export ledger
			</button>
		</div>
		<div class="cs-card overflow-x-auto">
			<table class="cs-table min-w-[1050px]">
				<thead
					><tr><th>Date</th><th>Shipment</th><th>Recipient</th><th>Amount</th><th>Status</th></tr
					></thead
				>
				<tbody>
					{#if filtered.length === 0}
						<tr
							><td colspan="5" class="cs-muted p-8 text-center">No settlement records found.</td
							></tr
						>
					{:else}
						{#each filtered as row (row.id)}<RoleSettlementRow {row} />{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</section>
</AppShell>
