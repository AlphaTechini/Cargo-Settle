<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import PartnerWorkCard from '$lib/components/PartnerWorkCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { formatCurrencyAmount, formatCurrencyTotals } from '$lib/dashboard';

	let { data }: { data: PageData } = $props();
</script>

<AppShell
	title="Partner overview"
	subtitle="Your assigned work, receivables, and settlement activity"
	active="overview"
	role="partner"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="grid gap-4 md:grid-cols-4">
			<MetricCard
				label="Assigned shipments"
				value={String(data.dashboard.metrics.assignedShipments)}
				note={`${data.dashboard.metrics.requiresAction} require action`}
				icon="container"
			/>
			<MetricCard
				label="Earned value"
				value={formatCurrencyTotals(data.dashboard.metrics.earnedValue)}
				note="Earned or approved obligations"
				icon="dollar"
			/>
			<MetricCard
				label="Available early"
				value={formatCurrencyTotals(data.dashboard.metrics.availableEarly)}
				note={data.dashboard.metrics.availableEarly.length
					? 'Financing-eligible obligations'
					: 'No eligible obligations'}
				icon="clock"
			/>
			<MetricCard
				label="Received this month"
				value={formatCurrencyTotals(data.dashboard.metrics.receivedThisMonth)}
				note={data.dashboard.metrics.receivedThisMonth.length
					? 'Confirmed settlements'
					: 'No confirmed settlements yet'}
				icon="check-circle"
			/>
		</div>

		<div class="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
			<div class="space-y-5">
				<div class="cs-card p-5">
					<div class="flex justify-between">
						<div>
							<h2 class="font-extrabold">Assigned work</h2>
							<p class="cs-muted mt-1 text-xs">Shipment and obligation records assigned to you</p>
						</div>
						<a href="/partner-shipments" class="text-sm font-bold text-teal-700">View all</a>
					</div>
					<div class="cs-divider mt-4 divide-y">
						{#if data.dashboard.assignedWork.length === 0}
							<p class="cs-muted py-5 text-sm">No shipments have been assigned yet.</p>
						{:else}
							{#each data.dashboard.assignedWork as item (item.id)}
								<PartnerWorkCard {item} />
							{/each}
						{/if}
					</div>
				</div>
				<div class="cs-card p-5">
					<h2 class="font-extrabold">Payment schedule</h2>
					<div class="cs-divider mt-4 divide-y">
						{#if data.dashboard.upcomingObligations.length === 0}
							<p class="cs-muted py-5 text-sm">No upcoming payment obligations.</p>
						{:else}
							{#each data.dashboard.upcomingObligations.slice(0, 4) as obligation (obligation.id)}
								<div class="flex items-center justify-between gap-3 py-4">
									<div>
										<p class="font-bold">{obligation.shipmentReference}</p>
										<p class="cs-muted mt-1 text-xs">
											Due {obligation.dueAt
												? new Date(obligation.dueAt).toLocaleDateString()
												: 'No due date'}
										</p>
									</div>
									<p class="font-extrabold">
										{formatCurrencyAmount(obligation.amount, obligation.currency)}
									</p>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
			<aside class="space-y-5">
				<div class="cs-card p-5">
					<h3 class="font-extrabold">Early payment eligibility</h3>
					<p class="cs-muted mt-2 text-sm">
						Financing-eligible obligations from the current workspace.
					</p>
					<div class="mt-4 space-y-3">
						{#if data.dashboard.eligibleEarlyPayments.length === 0}
							<p class="cs-muted text-sm">No eligible obligations yet.</p>
						{:else}
							{#each data.dashboard.eligibleEarlyPayments.slice(0, 3) as item (item.id)}
								<div class="cs-card-sm p-3">
									<div class="flex items-center justify-between gap-3">
										<div>
											<p class="text-sm font-bold">{item.shipmentReference}</p>
											<p class="cs-muted mt-1 text-xs">
												{formatCurrencyAmount(item.amount, item.currency)}
											</p>
										</div>
										<StatusBadge
											label={item.request?.status ?? 'Eligible'}
											tone={item.request ? 'info' : 'warning'}
										/>
									</div>
								</div>
							{/each}
						{/if}
					</div>
					<a href="/partner-early-payment" class="mt-4 inline-block text-sm font-bold text-teal-700"
						>Review eligibility</a
					>
				</div>
				<div class="cs-card p-5">
					<h3 class="font-extrabold">Latest settlement</h3>
					{#if data.dashboard.latestSettlement}
						<p class="mt-4 text-2xl font-extrabold">
							{formatCurrencyAmount(
								data.dashboard.latestSettlement.amount,
								data.dashboard.latestSettlement.currency
							)}
						</p>
						<p class="cs-muted mt-1 text-xs">{data.dashboard.latestSettlement.shipmentReference}</p>
					{:else}
						<p class="cs-muted mt-4 text-sm">No confirmed settlements yet.</p>
					{/if}
				</div>
			</aside>
		</div>
	</section>
</AppShell>
