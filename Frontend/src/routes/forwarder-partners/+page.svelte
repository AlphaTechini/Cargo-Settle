<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import OperationalObligationCard from '$lib/components/OperationalObligationCard.svelte';
	import RoleSettlementRow from '$lib/components/RoleSettlementRow.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { formatCurrencyTotals } from '$lib/dashboard';

	let { data }: { data: PageData } = $props();
	let tab = $state('Partners');
	let query = $state('');
	let filtered = $derived(
		data.partners.partners.filter((partner) =>
			`${partner.name} ${partner.email} ${partner.serviceTypes.join(' ')}`
				.toLowerCase()
				.includes(query.toLowerCase())
		)
	);

	function formatDate(value: string | null) {
		if (!value) return '';
		return new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(value));
	}
</script>

<AppShell
	title="Partners"
	subtitle="Review workspace service providers, obligations, and settlement records"
	active="partners"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="cs-divider mb-5 flex gap-5 overflow-x-auto border-b">
			{#each ['Partners', 'Obligations', 'Approvals', 'Settlements'] as item (item)}
				<button
					class={`border-b-2 pb-3 text-sm font-bold whitespace-nowrap ${tab === item ? 'border-teal-700 text-teal-700' : 'cs-muted border-transparent'}`}
					onclick={() => (tab = item)}>{item}</button
				>
			{/each}
		</div>

		{#if tab === 'Partners'}
			<div class="mb-5 flex justify-end">
				<input
					class="cs-input !w-[320px]"
					bind:value={query}
					placeholder="Search workspace partners"
				/>
			</div>
			<div class="cs-card overflow-x-auto">
				<table class="cs-table min-w-[1000px]">
					<thead
						><tr
							><th>Partner</th><th>Service types</th><th>Last paid</th><th>Open obligations</th><th
								>Open balance</th
							><th>Account</th></tr
						></thead
					>
					<tbody>
						{#if filtered.length === 0}
							<tr
								><td colspan="6" class="cs-muted p-8 text-center">No workspace partners found.</td
								></tr
							>
						{:else}
							{#each filtered as partner (partner.userId)}
								<tr>
									<td
										><p class="font-extrabold">{partner.name}</p>
										<p class="cs-muted mt-1 text-xs">{partner.email}</p></td
									>
									<td
										>{partner.serviceTypes.length
											? partner.serviceTypes.join(', ')
											: 'No assigned service type'}</td
									>
									<td>{formatDate(partner.lastPaidAt)}</td>
									<td>{partner.openObligations}</td>
									<td class="font-extrabold">{formatCurrencyTotals(partner.openBalance)}</td>
									<td
										><StatusBadge
											label={partner.accountStatus ?? 'No account'}
											tone={partner.accountStatus === 'verified'
												? 'success'
												: partner.accountStatus === 'suspended'
													? 'danger'
													: 'warning'}
										/></td
									>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		{:else if tab === 'Obligations'}
			<div class="cs-card p-5">
				<h2 class="font-extrabold">Partner obligations</h2>
				<div class="cs-divider mt-4 divide-y">
					{#if data.partners.obligations.length === 0}
						<p class="cs-muted py-5 text-sm">No partner obligations have been recorded.</p>
					{:else}
						{#each data.partners.obligations as obligation (obligation.id)}<OperationalObligationCard
								{obligation}
							/>{/each}
					{/if}
				</div>
			</div>
		{:else if tab === 'Approvals'}
			<div class="cs-card p-5">
				<h2 class="font-extrabold">Early-payment requests</h2>
				<p class="cs-muted mt-1 text-sm">
					Requests are displayed read-only until approval actions are persisted.
				</p>
				<div class="cs-divider mt-4 divide-y">
					{#if data.partners.earlyPaymentRequests.length === 0}
						<p class="cs-muted py-5 text-sm">No early-payment requests have been recorded.</p>
					{:else}
						{#each data.partners.earlyPaymentRequests as request (request.id)}
							<div class="flex flex-wrap items-center justify-between gap-3 py-4">
								<div>
									<p class="font-bold">{request.partnerName} · {request.shipmentReference}</p>
									<p class="cs-muted mt-1 text-xs">
										{request.amount}
										{request.currency.toUpperCase()}
									</p>
								</div>
								<StatusBadge
									label={request.status}
									tone={request.status === 'approved' || request.status === 'funded'
										? 'success'
										: request.status === 'declined'
											? 'danger'
											: 'warning'}
								/>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		{:else}
			<div class="cs-card overflow-x-auto">
				<table class="cs-table min-w-[900px]">
					<thead
						><tr><th>Date</th><th>Shipment</th><th>Recipient</th><th>Amount</th><th>Status</th></tr
						></thead
					>
					<tbody>
						{#if data.partners.settlements.length === 0}
							<tr
								><td colspan="5" class="cs-muted p-8 text-center"
									>No settlement records have been recorded.</td
								></tr
							>
						{:else}
							{#each data.partners.settlements as row (row.id)}<RoleSettlementRow {row} />{/each}
						{/if}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</AppShell>
