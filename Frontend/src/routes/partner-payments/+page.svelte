<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { downloadCsv } from '$lib/utils';
	const payments = [
		{
			date: 'Jul 29',
			shipment: 'SHP-2062',
			route: 'Antwerp -> Lagos',
			type: 'Early payment',
			gross: '$7,000',
			fee: '$200',
			net: '$6,800 USDC'
		},
		{
			date: 'Jul 22',
			shipment: 'SHP-2042',
			route: 'New York -> Hamburg',
			type: 'Milestone payout',
			gross: '$8,400',
			fee: '-',
			net: '$8,400 USDC'
		},
		{
			date: 'Jul 17',
			shipment: 'SHP-2038',
			route: 'Lagos -> Durban',
			type: 'Partner payout',
			gross: '$11,200',
			fee: '-',
			net: '$11,200 USDC'
		}
	];
	function exportPayments() {
		downloadCsv('cargosettle-partner-payments.csv', [
			['Date', 'Shipment', 'Type', 'Gross', 'Fee', 'Net received'],
			...payments.map((payment) => [
				payment.date,
				payment.shipment,
				payment.type,
				payment.gross,
				payment.fee,
				payment.net
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
				value="$26,400"
				note="4 settlements"
				icon="dollar"
			/><MetricCard
				label="Processing"
				value="EURC 3,800"
				note="1 obligation"
				icon="clock"
			/><MetricCard label="Next scheduled" value="$12,400" note="Aug 3" icon="receipt" />
		</div>
		<div class="mb-5 flex justify-between gap-3">
			<div class="flex gap-2">
				<button class="cs-filter">Currency</button><button class="cs-filter">Status</button><button
					class="cs-filter">Date</button
				>
			</div>
			<button class="cs-btn cs-btn-secondary" onclick={exportPayments}
				><Icon name="download" size={16} />Export</button
			>
		</div>
		<div class="cs-card overflow-x-auto">
			<table class="cs-table min-w-[900px]">
				<thead
					><tr
						><th>Date</th><th>Shipment</th><th>Type</th><th>Gross</th><th>Fee</th><th
							>Net received</th
						><th>Status</th></tr
					></thead
				><tbody
					>{#each payments as payment (payment.shipment)}<tr
							><td>{payment.date}</td><td
								><b>{payment.shipment}</b><br /><span class="cs-muted text-xs">{payment.route}</span
								></td
							><td>{payment.type}</td><td>{payment.gross}</td><td>{payment.fee}</td><td
								class="font-extrabold">{payment.net}</td
							><td><StatusBadge label="Confirmed" tone="success" /></td></tr
						>{/each}</tbody
				>
			</table>
		</div>
	</section>
</AppShell>
