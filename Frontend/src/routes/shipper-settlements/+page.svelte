<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { downloadCsv } from '$lib/utils';
	const rows = [
		{
			date: 'Jul 29',
			shipment: 'SHP-2048',
			route: 'New York -> Rotterdam',
			forwarder: 'Northstar Freight',
			funded: '$24,800',
			allocated: '$11,200',
			refunded: '-',
			status: 'In progress',
			tone: 'info'
		},
		{
			date: 'Jul 24',
			shipment: 'SHP-2038',
			route: 'Lagos -> Durban',
			forwarder: 'Harborline Forwarding',
			funded: '$38,600',
			allocated: '$38,600',
			refunded: '-',
			status: 'Completed',
			tone: 'success'
		},
		{
			date: 'Jul 11',
			shipment: 'SHP-2018',
			route: 'Miami -> Hamburg',
			forwarder: 'Northstar Freight',
			funded: '$29,400',
			allocated: '$28,900',
			refunded: '$500',
			status: 'Completed',
			tone: 'success'
		}
	];
	function exportSettlements() {
		downloadCsv('cargosettle-shipper-settlements.csv', [
			['Date', 'Shipment', 'Forwarder', 'Funded', 'Allocated', 'Refunded'],
			...rows.map((row) => [
				row.date,
				row.shipment,
				row.forwarder,
				row.funded,
				row.allocated,
				row.refunded
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
				value="$684.2K"
				note="42 shipments"
				icon="wallet"
			/><MetricCard label="Allocated" value="$621.8K" note="90.9%" icon="receipt" /><MetricCard
				label="Refunded"
				value="$12.6K"
				note="3 adjustments"
				icon="dollar"
			/>
		</div>
		<div class="mb-5 flex justify-between gap-3">
			<div class="flex gap-2">
				<button class="cs-filter">Status</button><button class="cs-filter">Forwarder</button><button
					class="cs-filter">Date</button
				>
			</div>
			<button class="cs-btn cs-btn-secondary" onclick={exportSettlements}
				><Icon name="download" size={16} />Export</button
			>
		</div>
		<div class="cs-card overflow-x-auto">
			<table class="cs-table min-w-[950px]">
				<thead
					><tr
						><th>Date</th><th>Shipment</th><th>Forwarder</th><th>Funded</th><th>Allocated</th><th
							>Refunded</th
						><th>Status</th></tr
					></thead
				><tbody
					>{#each rows as row (row.shipment)}<tr
							><td>{row.date}</td><td
								><b>{row.shipment}</b><br /><span class="cs-muted text-xs">{row.route}</span></td
							><td>{row.forwarder}</td><td>{row.funded}</td><td>{row.allocated}</td><td
								>{row.refunded}</td
							><td><StatusBadge label={row.status} tone={row.tone} /></td></tr
						>{/each}</tbody
				>
			</table>
		</div>
	</section>
</AppShell>
