<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let { data }: { data: PageData } = $props();
	let query = $state('');
	let earlyOnly = $state(false);
	let filtered = $derived(
		data.partners.partners.filter(
			(partner) =>
				`${partner.name} ${partner.email} ${partner.serviceTypes.join(' ')}`
					.toLowerCase()
					.includes(query.toLowerCase()) &&
				(!earlyOnly || partner.earlyPaymentEligible)
		)
	);
</script>

<AppShell
	title="Partner network"
	subtitle="Find service providers already recorded in this workspace"
	active="partners"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="grid gap-5 lg:grid-cols-[250px_1fr]">
			<aside class="cs-card h-fit p-5">
				<h2 class="font-extrabold">Filters</h2>
				<div class="mt-5 space-y-5">
					<label class="flex gap-2 text-sm"
						><input type="checkbox" bind:checked={earlyOnly} />Financing eligible</label
					>
					<button
						class="cs-btn cs-btn-secondary w-full"
						onclick={() => {
							query = '';
							earlyOnly = false;
						}}>Clear filters</button
					>
				</div>
			</aside>
			<section>
				<div class="mb-5 flex flex-wrap justify-between gap-3">
					<input
						class="cs-input min-w-[240px] flex-1"
						bind:value={query}
						placeholder="Search workspace partners"
					/>
				</div>
				<div class="mb-4">
					<h2 class="text-xl font-extrabold">Workspace partners</h2>
					<p class="cs-muted mt-1 text-sm">{filtered.length} matching service providers</p>
				</div>
				<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{#if filtered.length === 0}
						<div class="cs-card p-5 md:col-span-2 xl:col-span-3">
							<p class="cs-muted text-sm">No matching workspace partners.</p>
						</div>
					{:else}
						{#each filtered as partner (partner.userId)}
							<div class="cs-card p-5">
								<div class="flex items-start justify-between">
									<div
										class="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-xs font-extrabold"
									>
										{partner.initials}
									</div>
									<StatusBadge
										label={partner.earlyPaymentEligible ? 'Financing eligible' : 'Workspace member'}
										tone={partner.earlyPaymentEligible ? 'purple' : 'neutral'}
									/>
								</div>
								<h3 class="mt-5 font-extrabold">{partner.name}</h3>
								<p class="cs-muted mt-1 text-sm">
									{partner.serviceTypes.length
										? partner.serviceTypes.join(' · ')
										: 'No assigned service type'}
								</p>
								<p class="cs-muted mt-1 text-xs">{partner.email}</p>
								<div class="mt-4 flex flex-wrap gap-2">
									{#each partner.completedCurrencies as currency (currency)}<span
											class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold"
											>{currency.toUpperCase()}</span
										>{/each}
									<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold"
										>{partner.completedSettlements} confirmed settlements</span
									>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</section>
		</div>
	</section>
</AppShell>
