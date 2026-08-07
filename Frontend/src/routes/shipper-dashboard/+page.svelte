<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import ActiveShipmentCard from '$lib/components/ActiveShipmentCard.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import RecentSettlementCard from '$lib/components/RecentSettlementCard.svelte';
	import RequiresAttention from '$lib/components/RequiresAttention.svelte';
	import ShipmentStatusSummary from '$lib/components/ShipmentStatusSummary.svelte';
	import { formatCurrencyTotals } from '$lib/dashboard';

	let { data }: { data: PageData } = $props();
</script>

<AppShell
	title="Shipper overview"
	subtitle="Track funding, shipment progress, and payment allocation"
	active="overview"
	role="shipper"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="grid gap-4 md:grid-cols-4">
			<MetricCard
				label="Active shipments"
				value={String(data.dashboard.metrics.activeShipments)}
				note={`${data.dashboard.metrics.inTransitShipments} currently in transit`}
				icon="container"
			/>
			<MetricCard
				label="Awaiting funding"
				value={String(data.dashboard.metrics.awaitingFunding)}
				note={`${formatCurrencyTotals(data.dashboard.metrics.awaitingFundingTotals)} requested`}
				icon="wallet"
			/>
			<MetricCard
				label="Funded this month"
				value={formatCurrencyTotals(data.dashboard.metrics.fundedThisMonth)}
				note={data.dashboard.metrics.fundedThisMonth.length
					? 'Confirmed funding'
					: 'No confirmed funding this month'}
				icon="dollar"
			/>
			<MetricCard
				label="Settled"
				value={formatCurrencyTotals(data.dashboard.metrics.settled)}
				note={data.dashboard.metrics.settled.length
					? 'Confirmed settlements'
					: 'No confirmed settlements yet'}
				icon="check-circle"
			/>
		</div>
		<div class="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
			<div class="space-y-5">
				<ShipmentStatusSummary counts={data.dashboard.statusCounts} />
				<div class="cs-card p-5">
					<div class="flex justify-between">
						<div>
							<h2 class="font-extrabold">Active shipments</h2>
							<p class="cs-muted mt-1 text-xs">Latest commercial and settlement progress</p>
						</div>
						<a href="/shipper-shipments" class="text-sm font-bold text-teal-700">View all</a>
					</div>
					<div class="cs-divider mt-4 divide-y">
						{#if data.dashboard.activeShipments.length === 0}
							<p class="cs-muted py-5 text-sm">No funded or in-transit shipments yet.</p>
						{:else}
							{#each data.dashboard.activeShipments as shipment (shipment.id)}
								<ActiveShipmentCard {shipment} />
							{/each}
						{/if}
					</div>
				</div>
			</div>
			<aside class="space-y-5">
				<RequiresAttention items={data.dashboard.attention} />
				<RecentSettlementCard settlement={data.dashboard.recentSettlement} />
			</aside>
		</div>
	</section>
</AppShell>
