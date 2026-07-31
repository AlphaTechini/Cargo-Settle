<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { downloadCsv } from '$lib/utils';

	let reportOpen = $state(false);
	let generated = $state(false);
	let period = $state('Last 30 days');
	let reportType = $state('Settlement performance');
	function generateReport() {
		generated = true;
		reportOpen = false;
	}
	function exportReport() {
		downloadCsv('cargosettle-report.csv', [
			['Report', 'Period', 'Settled volume', 'Exceptions'],
			[reportType, period, '$428,600', '4']
		]);
	}
</script>

<AppShell
	title="Reports"
	subtitle="Turn shipment and settlement activity into operational insight"
	active="reports"
	><section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
			<div>
				<h2 class="text-2xl font-extrabold">Operations reports</h2>
				<p class="cs-muted mt-1 text-sm">Review performance across your shipment portfolio.</p>
			</div>
			<button class="cs-btn cs-btn-primary" onclick={() => (reportOpen = true)}
				><Icon name="plus" size={16} />Build report</button
			>
		</div>
		<div class="grid gap-4 md:grid-cols-3">
			<div class="cs-card p-5">
				<p class="cs-muted text-sm font-semibold">Settlement volume</p>
				<p class="cs-kpi mt-2 text-3xl font-extrabold">$428.6K</p>
				<p class="cs-muted mt-2 text-xs">+12.4% from prior period</p>
			</div>
			<div class="cs-card p-5">
				<p class="cs-muted text-sm font-semibold">Average settlement time</p>
				<p class="cs-kpi mt-2 text-3xl font-extrabold">1.8 sec</p>
				<p class="cs-muted mt-2 text-xs">Across 82 confirmed transactions</p>
			</div>
			<div class="cs-card p-5">
				<p class="cs-muted text-sm font-semibold">Open exceptions</p>
				<p class="cs-kpi mt-2 text-3xl font-extrabold">4</p>
				<p class="cs-muted mt-2 text-xs">1 critical liquidity issue</p>
			</div>
		</div>
		<div class="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
			<div class="cs-card p-5">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="font-extrabold">Saved reports</h3>
						<p class="cs-muted mt-1 text-xs">Reusable views for your operations team</p>
					</div>
					<button class="cs-filter" onclick={() => (reportOpen = true)}>Manage</button>
				</div>
				<div class="cs-divider mt-4 divide-y">
					<div class="flex items-center gap-3 py-4">
						<span class="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700"
							><Icon name="receipt" /></span
						>
						<div class="flex-1">
							<p class="font-bold">Settlement performance</p>
							<p class="cs-muted mt-1 text-xs">Last 30 days · Updated today</p>
						</div>
						<button
							class="cs-btn cs-btn-secondary !px-3"
							onclick={() => {
								reportType = 'Settlement performance';
								period = 'Last 30 days';
								reportOpen = true;
							}}>Open</button
						>
					</div>
					<div class="flex items-center gap-3 py-4">
						<span class="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-700"
							><Icon name="dollar" /></span
						>
						<div class="flex-1">
							<p class="font-bold">FX exposure</p>
							<p class="cs-muted mt-1 text-xs">Current month · Updated yesterday</p>
						</div>
						<button
							class="cs-btn cs-btn-secondary !px-3"
							onclick={() => {
								reportType = 'FX exposure';
								period = 'Current month';
								reportOpen = true;
							}}>Open</button
						>
					</div>
				</div>
			</div>
			<aside class="cs-card h-fit p-5">
				<h3 class="font-extrabold">Latest report</h3>
				{#if generated}<div class="mt-4 rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
						<p class="font-bold">{reportType}</p>
						<p class="mt-1">{period} · Ready to export</p>
					</div>
					<button class="cs-btn cs-btn-primary mt-4 w-full" onclick={exportReport}
						><Icon name="download" size={16} />Download CSV</button
					>{:else}<p class="cs-muted mt-4 text-sm">
						Build a report to see its summary and download the local CSV.
					</p>{/if}
			</aside>
		</div>
	</section></AppShell
>

<DemoModal
	open={reportOpen}
	title="Build report"
	description="Choose the local report view to generate."
	confirmLabel="Generate report"
	onClose={() => (reportOpen = false)}
	onConfirm={generateReport}
	><div class="space-y-4">
		<div>
			<label class="cs-label" for="report-type">Report type</label><select
				id="report-type"
				class="cs-input"
				bind:value={reportType}
				><option>Settlement performance</option><option>FX exposure</option><option
					>Shipment exceptions</option
				></select
			>
		</div>
		<div>
			<label class="cs-label" for="report-period">Period</label><select
				id="report-period"
				class="cs-input"
				bind:value={period}
				><option>Last 30 days</option><option>Current month</option><option>Last 90 days</option
				></select
			>
		</div>
		<label class="flex items-center gap-2 text-sm"
			><input type="checkbox" checked class="accent-teal-700" />Include shipment-level rows</label
		>
	</div></DemoModal
>
