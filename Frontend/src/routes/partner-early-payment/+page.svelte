<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { formatCurrencyAmount } from '$lib/dashboard';

	let { data }: { data: PageData } = $props();
</script>

<AppShell
	title="Early payment"
	subtitle="Review financing-eligible shipment obligations"
	active="early-payment"
	role="partner"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="mx-auto max-w-5xl space-y-5">
			<div>
				<h2 class="text-2xl font-extrabold">Early payment eligibility</h2>
				<p class="cs-muted mt-2 text-sm">
					Eligibility is derived from persisted financing flags. No payment action is performed
					here.
				</p>
			</div>
			{#if data.earlyPayment.eligibleEarlyPayments.length === 0}
				<div class="cs-card p-6">
					<p class="cs-muted text-sm">No financing-eligible obligations have been recorded.</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each data.earlyPayment.eligibleEarlyPayments as item (item.id)}
						<article class="cs-card p-5">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<p class="text-xs font-extrabold tracking-wider text-purple-700 uppercase">
										Eligible obligation
									</p>
									<h3 class="mt-2 text-xl font-extrabold">{item.shipmentReference}</h3>
									<p class="cs-muted mt-1 text-sm">
										Original obligation due {item.dueAt
											? new Date(item.dueAt).toLocaleDateString()
											: 'without a due date'}
									</p>
								</div>
								<StatusBadge
									label={item.request?.status ?? 'Eligible'}
									tone={item.request ? 'info' : 'warning'}
								/>
							</div>
							<div class="mt-5 grid gap-3 md:grid-cols-3">
								<div class="rounded-xl bg-slate-50 p-4">
									<p class="cs-muted text-xs">Obligation amount</p>
									<p class="mt-2 font-extrabold">
										{formatCurrencyAmount(item.amount, item.currency)}
									</p>
								</div>
								{#if item.request}
									<div class="rounded-xl bg-slate-50 p-4">
										<p class="cs-muted text-xs">Requested net amount</p>
										<p class="mt-2 font-extrabold">
											{formatCurrencyAmount(item.request.netAmount, item.currency)}
										</p>
									</div>
									<div class="rounded-xl bg-slate-50 p-4">
										<p class="cs-muted text-xs">Recorded fee</p>
										<p class="mt-2 font-extrabold">
											{formatCurrencyAmount(item.request.feeAmount, item.currency)}
										</p>
									</div>
								{:else}
									<div class="rounded-xl bg-slate-50 p-4 md:col-span-2">
										<p class="cs-muted text-xs">Request status</p>
										<p class="mt-2 font-extrabold">No early-payment request recorded</p>
									</div>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			{/if}
			<div class="cs-card p-5">
				<h3 class="font-extrabold">Verified wallets</h3>
				{#if data.earlyPayment.wallets.length === 0}
					<p class="cs-muted mt-3 text-sm">No verified wallet is linked to this account.</p>
				{:else}
					<div class="mt-3 space-y-3">
						{#each data.earlyPayment.wallets as wallet (wallet.id)}
							<div
								class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 text-sm"
							>
								<span class="font-bold">{wallet.network}</span>
								<span class="font-mono text-xs">{wallet.address}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</section>
</AppShell>
