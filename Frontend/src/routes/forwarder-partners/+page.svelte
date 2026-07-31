<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { partners } from '$lib/data/demo';

	let tab = $state('Partners');
	let query = $state('');
	let modal = $state<'add' | 'profile' | 'menu' | null>(null);
	let selectedPartnerName = $state('');
	let newName = $state('');
	let newType = $state('Trucking');
	let localPartners = $state([...partners]);
	let added = $state(false);
	let filtered = $derived(
		localPartners.filter((partner) =>
			`${partner.name} ${partner.type} ${partner.region}`
				.toLowerCase()
				.includes(query.toLowerCase())
		)
	);
	let selectedPartner = $derived(
		localPartners.find((partner) => partner.name === selectedPartnerName)
	);

	function confirmModal() {
		if (modal === 'add' && newName.trim()) {
			localPartners = [
				...localPartners,
				{
					initials: newName.slice(0, 2).toUpperCase(),
					name: newName,
					type: newType,
					region: 'United States',
					balance: '$0',
					status: 'Pending review',
					tone: 'warning'
				}
			];
			added = true;
			modal = null;
		}
	}
</script>

<AppShell
	title="Partners"
	subtitle="Manage service providers, obligations, and settlement readiness"
	active="partners"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="cs-divider mb-5 flex gap-5 overflow-x-auto border-b">
			{#each ['Partners', 'Obligations', 'Approvals', 'Settlements'] as item (item)}<button
					class={`border-b-2 pb-3 text-sm font-bold whitespace-nowrap ${tab === item ? 'border-teal-700 text-teal-700' : 'cs-muted border-transparent'}`}
					onclick={() => (tab = item)}>{item}</button
				>{/each}
		</div>
		{#if tab === 'Partners'}<div class="mb-5 flex flex-wrap justify-between gap-3">
				<div class="flex gap-2">
					<div class="relative">
						<Icon
							name="search"
							size={16}
							className="absolute left-3 top-1/2 -translate-y-1/2 cs-muted"
						/><input
							class="cs-input !w-[290px] !pl-9"
							bind:value={query}
							placeholder="Search partners"
						/>
					</div>
					<button class="cs-filter" onclick={() => (query = '')}
						><Icon name="filter" size={16} />Clear search</button
					>
				</div>
				<div class="flex gap-2">
					<a href="/forwarder-partner-directory" class="cs-btn cs-btn-secondary">Browse network</a
					><button class="cs-btn cs-btn-primary" onclick={() => (modal = 'add')}
						><Icon name="plus" size={16} />Add partner</button
					>
				</div>
			</div>
			<div class="cs-card overflow-x-auto">
				<table class="cs-table min-w-[1050px]">
					<thead
						><tr
							><th><input type="checkbox" /></th><th>Partner</th><th>Operating region</th><th
								>Last paid</th
							><th>Open obligations</th><th>Open balance</th><th>Verification</th><th></th></tr
						></thead
					><tbody
						>{#each filtered as partner (partner.name)}<tr
								><td><input type="checkbox" /></td><td
									><div class="flex items-center gap-3">
										<div
											class="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-extrabold"
										>
											{partner.initials}
										</div>
										<div>
											<button
												class="font-extrabold text-teal-700"
												onclick={() => {
													selectedPartnerName = partner.name;
													modal = 'profile';
												}}>{partner.name}</button
											>
											<p class="cs-muted mt-1 text-xs">{partner.type}</p>
										</div>
									</div></td
								><td>{partner.region}</td><td>Jul 22</td><td>2</td><td class="font-bold"
									>{partner.balance}</td
								><td><StatusBadge label={partner.status} tone={partner.tone} /></td><td
									><button
										aria-label={`Open ${partner.name} menu`}
										class="cs-muted"
										onclick={() => {
											selectedPartnerName = partner.name;
											modal = 'menu';
										}}><Icon name="more" size={16} /></button
									></td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>{:else if tab === 'Obligations'}<div class="cs-card overflow-x-auto">
				<table class="cs-table min-w-[760px]">
					<thead
						><tr><th>Partner</th><th>Shipment</th><th>Amount</th><th>Due</th><th>Status</th></tr
						></thead
					><tbody
						><tr
							><td>Rotterdam Port Services</td><td>SHP-2048</td><td>EURC 8,500</td><td>Aug 2</td><td
								><StatusBadge label="FX required" tone="purple" /></td
							></tr
						><tr
							><td>Metro Logistics</td><td>SHP-2048</td><td>$9,700</td><td>Aug 29</td><td
								><StatusBadge label="Early pay eligible" tone="warning" /></td
							></tr
						></tbody
					>
				</table>
			</div>{:else if tab === 'Approvals'}<div class="grid gap-4 md:grid-cols-2">
				<div class="cs-card p-5">
					<StatusBadge label="Pending approval" tone="warning" />
					<h3 class="mt-4 font-extrabold">Metro Logistics early payment</h3>
					<p class="cs-muted mt-1 text-sm">$9,700 · SHP-2048 · Due today</p>
					<button class="cs-btn cs-btn-primary mt-5" onclick={() => (added = true)}
						>Approve request</button
					>
				</div>
				<div class="cs-card p-5">
					<StatusBadge label="Pending review" tone="neutral" />
					<h3 class="mt-4 font-extrabold">BlueLine settlement account</h3>
					<p class="cs-muted mt-1 text-sm">Verification documents submitted Jul 28</p>
					<button class="cs-btn cs-btn-secondary mt-5" onclick={() => (modal = 'profile')}
						>Review documents</button
					>
				</div>
			</div>{:else}<div class="cs-card overflow-x-auto">
				<table class="cs-table min-w-[760px]">
					<thead
						><tr><th>Date</th><th>Partner</th><th>Shipment</th><th>Amount</th><th>Status</th></tr
						></thead
					><tbody
						><tr
							><td>Jul 29</td><td>Atlantic Ocean Lines</td><td>SHP-2048</td><td>$8,000 USDC</td><td
								><StatusBadge label="Confirmed" tone="success" /></td
							></tr
						><tr
							><td>Jul 28</td><td>BlueLine Warehousing</td><td>SHP-2059</td><td>EURC 3,200</td><td
								><StatusBadge label="Processing" tone="info" /></td
							></tr
						></tbody
					>
				</table>
			</div>{/if}{#if added}<div class="mt-4 rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
				{newName
					? `${newName} was added to the local partner list.`
					: 'Approval recorded in the local partner workflow.'}
			</div>{/if}
	</section>
</AppShell>

<DemoModal
	open={modal !== null}
	title={modal === 'add'
		? 'Add partner'
		: modal === 'profile'
			? (selectedPartner?.name ?? 'Partner profile')
			: 'Partner actions'}
	description={modal === 'add'
		? 'Create a local partner record for future obligations.'
		: 'Review partner information and available local actions.'}
	confirmLabel="Add partner"
	showConfirm={modal === 'add'}
	onClose={() => (modal = null)}
	onConfirm={confirmModal}
	>{#if modal === 'add'}<div class="space-y-4">
			<div>
				<label class="cs-label" for="partner-name">Company name</label><input
					id="partner-name"
					class="cs-input"
					bind:value={newName}
					placeholder="Harborline Transport"
				/>
			</div>
			<div>
				<label class="cs-label" for="partner-type">Service type</label><select
					id="partner-type"
					class="cs-input"
					bind:value={newType}
					><option>Trucking</option><option>Warehouse</option><option>Customs broker</option><option
						>Port agent</option
					></select
				>
			</div>
		</div>{:else if modal === 'profile'}<div class="space-y-4">
			<div class="flex items-center gap-3">
				<div
					class="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 font-extrabold text-teal-700"
				>
					{selectedPartner?.initials}
				</div>
				<div>
					<p class="font-extrabold">{selectedPartner?.name}</p>
					<p class="cs-muted text-sm">{selectedPartner?.type} · {selectedPartner?.region}</p>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-xl bg-slate-50 p-4">
					<p class="cs-muted text-xs">Open balance</p>
					<p class="mt-1 font-extrabold">{selectedPartner?.balance}</p>
				</div>
				<div class="rounded-xl bg-slate-50 p-4">
					<p class="cs-muted text-xs">Verification</p>
					<p class="mt-1 font-extrabold">{selectedPartner?.status}</p>
				</div>
			</div>
		</div>{:else}<div class="space-y-3">
			<button
				class="cs-card-sm flex w-full items-center justify-between p-4 text-left"
				onclick={() => (modal = 'profile')}
				>View profile <Icon name="arrow-right" size={16} /></button
			><a
				class="cs-card-sm flex items-center justify-between p-4"
				href="/forwarder-obligation-create"
				>Create obligation <Icon name="arrow-right" size={16} /></a
			>
		</div>{/if}</DemoModal
>
