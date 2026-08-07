<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import OperationalObligationCard from '$lib/components/OperationalObligationCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { formatCurrencyTotals } from '$lib/dashboard';

	let { data }: { data: PageData } = $props();
</script>

<AppShell
	title="Treasury & FX"
	subtitle="Review linked settlement accounts and upcoming obligation coverage"
	active="treasury"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="grid gap-5 xl:grid-cols-[340px_1fr]">
			<aside class="cs-card p-5">
				<h2 class="text-xl font-extrabold">Settlement accounts</h2>
				<p class="cs-muted mt-1 text-xs">Accounts recorded for this workspace</p>
				<div class="cs-divider mt-5 divide-y">
					{#if data.dashboard.treasury.accounts.length === 0}
						<p class="cs-muted py-4 text-sm">No settlement accounts have been recorded.</p>
					{:else}
						{#each data.dashboard.treasury.accounts as account (account.id)}
							<div class="py-4">
								<div class="flex items-center justify-between gap-3">
									<p class="font-bold">{account.network}</p>
									<StatusBadge
										label={account.status}
										tone={account.status === 'verified'
											? 'success'
											: account.status === 'suspended'
												? 'danger'
												: 'warning'}
									/>
								</div>
								<p class="cs-muted mt-2 font-mono text-xs break-all">{account.address}</p>
								<p class="cs-muted mt-1 text-xs">{account.currency.toUpperCase()}</p>
							</div>
						{/each}
					{/if}
				</div>
			</aside>
			<section class="space-y-5">
				<div class="cs-card p-6">
					<p class="cs-muted text-xs font-bold tracking-wider uppercase">
						Obligation coverage input
					</p>
					<h2 class="mt-2 text-2xl font-extrabold">Upcoming obligations</h2>
					<p class="cs-muted mt-2 text-sm">
						The database currently records obligations, not wallet balances or reserved liquidity.
					</p>
					<div class="mt-6 grid gap-3 md:grid-cols-2">
						<div class="cs-card-sm p-4">
							<p class="cs-muted text-xs">Open obligations</p>
							<p class="mt-2 text-xl font-extrabold">
								{formatCurrencyTotals(data.dashboard.treasury.obligations)}
							</p>
						</div>
						<div class="cs-card-sm p-4">
							<p class="cs-muted text-xs">Wallet balance</p>
							<p class="mt-2 text-xl font-extrabold">0</p>
							<p class="cs-muted mt-1 text-xs">No balance source is connected</p>
						</div>
					</div>
				</div>
				<div class="cs-card p-5">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="font-extrabold">Obligations requiring readiness</h3>
							<p class="cs-muted mt-1 text-xs">Amounts and due dates from payment obligations</p>
						</div>
						<a href="/forwarder-settlements" class="text-sm font-bold text-teal-700"
							>View settlements</a
						>
					</div>
					<div class="cs-divider mt-4 divide-y">
						{#if data.dashboard.upcomingObligations.length === 0}
							<p class="cs-muted py-4 text-sm">No upcoming obligations have been recorded.</p>
						{:else}
							{#each data.dashboard.upcomingObligations as obligation (obligation.id)}
								<OperationalObligationCard {obligation} />
							{/each}
						{/if}
					</div>
				</div>
			</section>
		</div>
	</section>
</AppShell>
