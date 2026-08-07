<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import { formatCurrencyTotals } from '$lib/dashboard';
	import { downloadCsv } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	function exportReport() {
		downloadCsv('cargosettle-operations-report.csv', [
			['Metric', 'Value'],
			[
				'Settlement volume this month',
				formatCurrencyTotals(data.dashboard.reports.settlementVolume)
			],
			[
				'Average confirmation seconds',
				String(data.dashboard.reports.averageConfirmationSeconds ?? 0)
			],
			['Open exceptions', String(data.dashboard.reports.openExceptions)]
		]);
	}
</script>

<AppShell
	title="Reports"
	subtitle="Operational insight from shipment and settlement records"
	active="reports"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
			<div>
				<h2 class="text-2xl font-extrabold">Operations report</h2>
				<p class="cs-muted mt-1 text-sm">
					Current workspace aggregates. Saved reports are not stored yet.
				</p>
			</div>
			<button class="cs-btn cs-btn-secondary" onclick={exportReport}
				><Icon name="download" size={16} />Export CSV</button
			>
		</div>
		<div class="grid gap-4 md:grid-cols-3">
			<MetricCard
				label="Settlement volume"
				value={formatCurrencyTotals(data.dashboard.reports.settlementVolume)}
				note="Confirmed this month"
				icon="dollar"
			/>
			<MetricCard
				label="Average confirmation"
				value={data.dashboard.reports.averageConfirmationSeconds === null
					? '0'
					: `${data.dashboard.reports.averageConfirmationSeconds}s`}
				note={data.dashboard.reports.averageConfirmationSeconds === null
					? 'No timing records'
					: 'Created to confirmation'}
				icon="check-circle"
			/>
			<MetricCard
				label="Open exceptions"
				value={String(data.dashboard.reports.openExceptions)}
				note={data.dashboard.reports.openExceptions
					? 'Failed, blocked, or overdue records'
					: 'No open exceptions'}
				icon="alert"
			/>
		</div>
		<div class="cs-card mt-5 p-5">
			<h3 class="font-extrabold">Report scope</h3>
			<div class="mt-4 grid gap-3 md:grid-cols-3">
				<div class="cs-card-sm p-4">
					<p class="cs-muted text-xs">Settlement period</p>
					<p class="mt-2 font-extrabold">Current month</p>
				</div>
				<div class="cs-card-sm p-4">
					<p class="cs-muted text-xs">Currency handling</p>
					<p class="mt-2 font-extrabold">USDC and EURC separate</p>
				</div>
				<div class="cs-card-sm p-4">
					<p class="cs-muted text-xs">Data source</p>
					<p class="mt-2 font-extrabold">Workspace database records</p>
				</div>
			</div>
		</div>
	</section>
</AppShell>
