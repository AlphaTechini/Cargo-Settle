<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	const network = [
		{
			initials: 'RP',
			name: 'Rotterdam Port Services',
			type: 'Port agent',
			region: 'Netherlands',
			currency: 'EURC',
			count: 42,
			tone: 'success'
		},
		{
			initials: 'NC',
			name: 'NorthSea Customs BV',
			type: 'Customs broker',
			region: 'Benelux',
			currency: 'EURC',
			count: 28,
			tone: 'success'
		},
		{
			initials: 'ML',
			name: 'Metro Logistics',
			type: 'Trucking',
			region: 'United States',
			currency: 'USDC',
			count: 65,
			tone: 'purple'
		},
		{
			initials: 'BW',
			name: 'BlueLine Warehousing',
			type: 'Warehouse',
			region: 'Germany',
			currency: 'EURC',
			count: 19,
			tone: 'warning'
		}
	];
	let query = $state('');
	let earlyOnly = $state(false);
	let sort = $state('Most active');
	let modal = $state<'profile' | 'assign' | null>(null);
	let selectedName = $state('');
	let assigned = $state<string[]>([]);
	let selected = $derived(network.find((partner) => partner.name === selectedName));
	let filtered = $derived(
		network.filter(
			(partner) =>
				`${partner.name} ${partner.type} ${partner.region}`
					.toLowerCase()
					.includes(query.toLowerCase()) &&
				(!earlyOnly || partner.tone === 'purple')
		)
	);
	function assignPartner() {
		if (selectedName && !assigned.includes(selectedName)) assigned = [...assigned, selectedName];
		modal = null;
	}
</script>

<AppShell
	title="Partner network"
	subtitle="Find and assign verified logistics providers"
	active="partners"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="grid gap-5 lg:grid-cols-[250px_1fr]">
			<aside class="cs-card h-fit p-5">
				<h2 class="font-extrabold">Filters</h2>
				<div class="mt-5 space-y-6">
					<div>
						<p class="cs-label">Service type</p>
						<label class="mb-2 flex gap-2 text-sm"
							><input type="checkbox" checked />Port agent</label
						><label class="mb-2 flex gap-2 text-sm"
							><input type="checkbox" checked />Customs broker</label
						><label class="mb-2 flex gap-2 text-sm"><input type="checkbox" />Trucking</label><label
							class="flex gap-2 text-sm"><input type="checkbox" />Warehouse</label
						>
					</div>
					<div>
						<p class="cs-label">Currency</p>
						<label class="mb-2 flex gap-2 text-sm"><input type="checkbox" checked />USDC</label
						><label class="flex gap-2 text-sm"><input type="checkbox" checked />EURC</label>
					</div>
					<div>
						<p class="cs-label">Capabilities</p>
						<label class="flex gap-2 text-sm"
							><input type="checkbox" bind:checked={earlyOnly} />Early payment</label
						><label class="flex gap-2 text-sm"
							><input type="checkbox" />Verified settlement account</label
						>
					</div>
				</div>
			</aside>
			<section>
				<div class="mb-5 flex flex-wrap justify-between gap-3">
					<div class="relative flex-1">
						<Icon
							name="search"
							size={16}
							className="absolute left-3 top-1/2 -translate-y-1/2 cs-muted"
						/><input
							class="cs-input !pl-9"
							bind:value={query}
							placeholder="Search partners by company, service, or region"
						/>
					</div>
					<select class="cs-filter" bind:value={sort}
						><option>Most active</option><option>Highest completion</option><option>Newest</option
						></select
					>
				</div>
				<div class="mb-4 flex items-center justify-between">
					<div>
						<h2 class="text-xl font-extrabold">Partner network</h2>
						<p class="cs-muted mt-1 text-sm">
							{filtered.length} matching service providers{assigned.length
								? ` · ${assigned.length} assigned`
								: ''}
						</p>
					</div>
					<button
						class="text-sm font-bold text-teal-700"
						onclick={() => {
							query = '';
							earlyOnly = false;
							sort = 'Most active';
						}}>Clear filters</button
					>
				</div>
				<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{#each filtered as partner (partner.name)}<div class="cs-card p-5">
							<div class="flex items-start justify-between">
								<div
									class="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-xs font-extrabold"
								>
									{partner.initials}
								</div>
								<StatusBadge
									label={partner.tone === 'purple'
										? 'Early pay'
										: partner.tone === 'warning'
											? 'Review'
											: 'Verified'}
									tone={partner.tone}
								/>
							</div>
							<h3 class="mt-5 font-extrabold">{partner.name}</h3>
							<p class="cs-muted mt-1 text-sm">{partner.type} · {partner.region}</p>
							<div class="mt-4 flex flex-wrap gap-2">
								<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold"
									>{partner.currency}</span
								><span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold"
									>{partner.count} completed settlements</span
								>
							</div>
							<div class="mt-5 flex gap-2">
								<button
									class="cs-btn cs-btn-secondary flex-1"
									onclick={() => {
										selectedName = partner.name;
										modal = 'profile';
									}}>View profile</button
								><button
									class="cs-btn cs-btn-primary flex-1"
									onclick={() => {
										selectedName = partner.name;
										modal = 'assign';
									}}
									disabled={assigned.includes(partner.name)}
									>{assigned.includes(partner.name) ? 'Assigned' : 'Assign'}</button
								>
							</div>
						</div>{/each}
				</div>
			</section>
		</div>
	</section>
</AppShell>

<DemoModal
	open={modal !== null}
	title={modal === 'profile' ? (selected?.name ?? 'Partner profile') : 'Assign partner'}
	description={modal === 'profile'
		? 'Review local capability and settlement information.'
		: 'Assign this provider to the current shipment workflow.'}
	confirmLabel="Assign to shipment"
	showConfirm={modal === 'assign'}
	onClose={() => (modal = null)}
	onConfirm={assignPartner}
	>{#if modal === 'profile'}<div class="space-y-4">
			<div class="flex items-center gap-3">
				<div
					class="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 font-extrabold text-teal-700"
				>
					{selected?.initials}
				</div>
				<div>
					<p class="font-extrabold">{selected?.name}</p>
					<p class="cs-muted text-sm">{selected?.type} · {selected?.region}</p>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-xl bg-slate-50 p-4">
					<p class="cs-muted text-xs">Settlement currency</p>
					<p class="mt-1 font-extrabold">{selected?.currency}</p>
				</div>
				<div class="rounded-xl bg-slate-50 p-4">
					<p class="cs-muted text-xs">Completed</p>
					<p class="mt-1 font-extrabold">{selected?.count}</p>
				</div>
			</div>
		</div>{:else}<div class="rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
			<p class="font-bold">{selected?.name}</p>
			<p class="mt-1">This provider will be added to SHP-2089 with a new obligation slot.</p>
		</div>{/if}</DemoModal
>
