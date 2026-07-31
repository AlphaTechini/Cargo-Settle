<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { settlements } from '$lib/data/demo';
	import { downloadCsv } from '$lib/utils';

	let query = $state('');
	let modal = $state<'scan' | 'detail' | null>(null);
	let selectedId = $state('');
	let filtered = $derived(
		settlements.filter((item) =>
			`${item.id} ${item.shipment} ${item.recipient}`.toLowerCase().includes(query.toLowerCase())
		)
	);
	let selected = $derived(settlements.find((item) => item.id === selectedId));
	function exportLedger() {
		downloadCsv('cargosettle-settlement-ledger.csv', [
			['Date', 'Settlement', 'Shipment', 'Recipient', 'Amount', 'Status'],
			...settlements.map((item) => [
				item.date,
				item.id,
				item.shipment,
				item.recipient,
				item.amount,
				item.status
			])
		]);
	}
</script>

<AppShell
	title="Settlements"
	subtitle="Audit every shipment-linked payment and conversion"
	active="settlements"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="mb-5 grid gap-4 md:grid-cols-4">
			<MetricCard
				label="Settled this month"
				value="$428.6K"
				note="82 transactions"
				icon="dollar"
			/><MetricCard
				label="Processing"
				value="$18.4K"
				note="5 transactions"
				icon="clock"
			/><MetricCard label="Failed" value="$24.0K" note="1 transaction" icon="alert" /><MetricCard
				label="Average confirmation"
				value="1.8 sec"
				note="Arc Testnet"
				icon="check-circle"
			/>
		</div>
		<div class="mb-5 flex flex-wrap justify-between gap-3">
			<div class="flex flex-wrap gap-2">
				<div class="relative">
					<Icon
						name="search"
						size={16}
						className="absolute left-3 top-1/2 -translate-y-1/2 cs-muted"
					/><input
						class="cs-input !w-[300px] !pl-9"
						bind:value={query}
						placeholder="Search settlements"
					/>
				</div>
				<button class="cs-filter">Status</button><button class="cs-filter">Currency</button><button
					class="cs-filter">Date</button
				>
			</div>
			<button class="cs-btn cs-btn-secondary" onclick={exportLedger}
				><Icon name="download" size={16} />Export ledger</button
			>
		</div>
		<div class="cs-card overflow-x-auto">
			<table class="cs-table min-w-[1100px]">
				<thead
					><tr
						><th><input type="checkbox" /></th><th>Date</th><th>Settlement</th><th>Recipient</th><th
							>Amount</th
						><th>Type</th><th>Status</th><th>ArcScan</th></tr
					></thead
				><tbody
					>{#each filtered as item (item.id)}<tr
							><td><input type="checkbox" /></td><td><p class="font-bold">{item.date}</p></td><td
								><button
									class="text-left font-extrabold text-teal-700"
									onclick={() => {
										selectedId = item.id;
										modal = 'detail';
									}}>{item.id}</button
								>
								<p class="cs-muted mt-1 text-xs">{item.shipment}</p></td
							><td>{item.recipient}</td><td class="font-extrabold">{item.amount}</td><td
								>{item.type}</td
							><td><StatusBadge label={item.status} tone={item.tone} /></td><td
								><button
									class="cs-muted"
									onclick={() => {
										selectedId = item.id;
										modal = 'scan';
									}}><Icon name="arrow-up-right" size={16} /></button
								></td
							></tr
						>{/each}</tbody
				>
			</table>
		</div>
	</section>
</AppShell>

<DemoModal
	open={modal !== null}
	title={modal === 'scan' ? 'ArcScan transaction' : 'Settlement details'}
	description={modal === 'scan'
		? 'Review the local transaction record associated with this settlement.'
		: 'Review the selected settlement record.'}
	showConfirm={false}
	onClose={() => (modal = null)}
	>{#if selected}<div class="space-y-4">
			<div class="flex justify-between">
				<span class="cs-muted">Settlement</span><b>{selected.id}</b>
			</div>
			<div class="flex justify-between">
				<span class="cs-muted">Shipment</span><b>{selected.shipment}</b>
			</div>
			<div class="flex justify-between">
				<span class="cs-muted">Recipient</span><b>{selected.recipient}</b>
			</div>
			<div class="flex justify-between">
				<span class="cs-muted">Amount</span><b>{selected.amount}</b>
			</div>
			{#if modal === 'scan'}<div class="rounded-xl bg-slate-50 p-4 text-sm">
					<p class="font-bold">Transaction hash</p>
					<p class="cs-muted mt-1 font-mono text-xs break-all">
						0x8f2d3c...demo-settlement-{selected.id.toLowerCase()}
					</p>
					<p class="cs-muted mt-3 text-xs">
						Chain links will be wired during the backend and wallet pass.
					</p>
				</div>{/if}
		</div>{/if}</DemoModal
>
