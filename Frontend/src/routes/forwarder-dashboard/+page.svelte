<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import ForwarderShipmentCard from '$lib/components/ForwarderShipmentCard.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import OperationalObligationCard from '$lib/components/OperationalObligationCard.svelte';
	import RequiresAttention from '$lib/components/RequiresAttention.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { formatCurrencyTotals } from '$lib/dashboard';

	let { data }: { data: PageData } = $props();
</script>

<AppShell
	title="Operations overview"
	subtitle="Shipment, obligation, and settlement activity from your workspace"
	active="overview"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
			<MetricCard
				label="Active shipments"
				value={String(data.dashboard.metrics.activeShipments)}
				note={`${data.dashboard.workflow.inTransit} currently in transit`}
				icon="container"
			/>
			<MetricCard
				label="Settlement volume"
				value={formatCurrencyTotals(data.dashboard.metrics.settlementVolume)}
				note="Confirmed this month"
				icon="dollar"
			/>
			<MetricCard
				label="Ready to settle"
				value={String(data.dashboard.workflow.readyToSettle)}
				note={`${formatCurrencyTotals(data.dashboard.metrics.readyToSettle)} outstanding`}
				icon="check-circle"
			/>
			<MetricCard
				label="Exceptions"
				value={String(data.dashboard.metrics.exceptions)}
				note={data.dashboard.metrics.exceptions
					? 'Failed, blocked, or overdue records'
					: 'No open exceptions'}
				icon="alert"
			/>
		</div>

		<div class="cs-card mt-5 overflow-hidden">
			<div class="cs-divider flex items-center justify-between border-b px-5 py-4">
				<div>
					<h2 class="font-extrabold">Shipment settlement workflow</h2>
					<p class="cs-muted mt-1 text-xs">Current operational records grouped by next action</p>
				</div>
				<a href="/forwarder-shipments" class="text-sm font-bold text-teal-700">View shipments</a>
			</div>
			<div class="grid md:grid-cols-4">
				<div class="cs-divider border-t-4 border-t-amber-500 p-5 md:border-r">
					<p class="cs-muted text-xs font-extrabold tracking-wider uppercase">Funding</p>
					<p class="cs-kpi mt-4 text-3xl font-extrabold">
						{data.dashboard.workflow.fundingRequests}
					</p>
					<p class="mt-1 font-bold">Requests open</p>
				</div>
				<div class="cs-divider border-t-4 border-t-blue-500 p-5 md:border-r">
					<p class="cs-muted text-xs font-extrabold tracking-wider uppercase">In transit</p>
					<p class="cs-kpi mt-4 text-3xl font-extrabold">{data.dashboard.workflow.inTransit}</p>
					<p class="mt-1 font-bold">Active shipments</p>
				</div>
				<div class="cs-divider border-t-4 border-t-purple-500 p-5 md:border-r">
					<p class="cs-muted text-xs font-extrabold tracking-wider uppercase">Review</p>
					<p class="cs-kpi mt-4 text-3xl font-extrabold">
						{data.dashboard.workflow.milestoneReview}
					</p>
					<p class="mt-1 font-bold">Blocked milestones</p>
				</div>
				<div class="border-t-4 border-t-emerald-500 p-5">
					<p class="cs-muted text-xs font-extrabold tracking-wider uppercase">Settlement</p>
					<p class="cs-kpi mt-4 text-3xl font-extrabold">{data.dashboard.workflow.readyToSettle}</p>
					<p class="mt-1 font-bold">Ready obligations</p>
				</div>
			</div>
		</div>

		<div class="mt-5 grid gap-5 xl:grid-cols-[1fr_330px]">
			<div class="space-y-5">
				<div class="cs-card p-5">
					<div class="flex items-center justify-between">
						<div>
							<h2 class="font-extrabold">Active shipments</h2>
							<p class="cs-muted mt-1 text-xs">
								Live shipment records in funded or in-transit status
							</p>
						</div>
						<a href="/forwarder-shipments" class="text-sm font-bold text-teal-700">View all</a>
					</div>
					<div class="cs-divider mt-4 divide-y">
						{#if data.dashboard.activeShipments.length === 0}
							<p class="cs-muted py-5 text-sm">No active shipments yet.</p>
						{:else}
							{#each data.dashboard.activeShipments as shipment (shipment.id)}
								<ForwarderShipmentCard {shipment} />
							{/each}
						{/if}
					</div>
				</div>
				<div class="cs-card p-5">
					<div class="flex items-center justify-between">
						<div>
							<h2 class="font-extrabold">Today’s milestones</h2>
							<p class="cs-muted mt-1 text-xs">Milestones due today from the shipment records</p>
						</div>
					</div>
					<div class="cs-divider mt-4 divide-y">
						{#if data.dashboard.todayMilestones.length === 0}
							<p class="cs-muted py-5 text-sm">No milestones are due today.</p>
						{:else}
							{#each data.dashboard.todayMilestones as milestone (milestone.id)}
								<div class="flex items-center justify-between gap-3 py-4">
									<div>
										<p class="font-bold">{milestone.label}</p>
										<p class="cs-muted mt-1 text-xs">{milestone.shipmentReference}</p>
									</div>
									<StatusBadge
										label={milestone.status.replace('_', ' ')}
										tone={milestone.status === 'blocked' ? 'danger' : 'info'}
									/>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
			<aside class="space-y-5">
				<RequiresAttention items={data.dashboard.attention} />
				<div class="cs-card p-5">
					<h3 class="font-extrabold">Upcoming obligations</h3>
					<div class="cs-divider mt-4 divide-y">
						{#if data.dashboard.upcomingObligations.length === 0}
							<p class="cs-muted py-4 text-sm">No upcoming obligations.</p>
						{:else}
							{#each data.dashboard.upcomingObligations.slice(0, 3) as obligation (obligation.id)}
								<OperationalObligationCard {obligation} />
							{/each}
						{/if}
					</div>
				</div>
			</aside>
		</div>
	</section>
</AppShell>
