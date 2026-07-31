<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { shipments } from '$lib/data/demo';

	let query = $state('');
	let selected = $state<string[]>([]);
	let activeFilter = $state('All statuses');
	let page = $state(1);
	let filtered = $derived(
		shipments.filter(
			(shipment) =>
				`${shipment.id} ${shipment.route} ${shipment.client}`
					.toLowerCase()
					.includes(query.toLowerCase()) &&
				(activeFilter === 'All statuses' || shipment.status === activeFilter)
		)
	);

	function toggle(id: string) {
		selected = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];
	}
</script>

<AppShell
	title="Shipments"
	subtitle="Monitor shipment progress and financial obligations"
	active="shipments"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
			<div class="flex flex-wrap gap-2">
				<select class="cs-filter" bind:value={activeFilter}
					><option>All statuses</option><option>In transit</option><option>Ready to settle</option
					><option>Awaiting funding</option><option>Completed</option></select
				><button class="cs-filter">Route</button><button class="cs-filter">Client</button><button
					class="cs-filter">Due date</button
				>
			</div>
			<div class="relative">
				<Icon
					name="search"
					size={16}
					className="absolute left-3 top-1/2 -translate-y-1/2 cs-muted"
				/><input
					class="cs-input !w-[260px] !pl-9"
					bind:value={query}
					placeholder="Search shipments"
				/>
			</div>
		</div>
		<div class="mb-5 grid gap-4 md:grid-cols-4">
			<MetricCard
				label="All shipments"
				value="48"
				note="Across 14 clients"
				icon="container"
			/><MetricCard label="In transit" value="18" note="2 delayed" icon="ship" /><MetricCard
				label="Ready to settle"
				value="8"
				note="$31,420"
				icon="check-circle"
			/><MetricCard label="Exceptions" value="4" note="1 payment blocked" icon="alert" />
		</div>
		<div class="cs-card overflow-x-auto">
			<table class="cs-table min-w-[1100px]">
				<thead
					><tr
						><th
							><input
								type="checkbox"
								checked={selected.length === filtered.length && filtered.length > 0}
								onchange={() =>
									(selected =
										selected.length === filtered.length ? [] : filtered.map((item) => item.id))}
							/></th
						><th>Shipment</th><th>Route / client</th><th>Partners</th><th>Funded value</th><th
							>Status</th
						><th>Next milestone</th><th></th></tr
					></thead
				><tbody
					>{#each filtered as shipment (shipment.id)}<tr
							><td
								><input
									type="checkbox"
									checked={selected.includes(shipment.id)}
									onchange={() => toggle(shipment.id)}
								/></td
							><td
								><a href="/forwarder-shipment-detail" class="font-extrabold text-teal-700"
									>{shipment.id}</a
								></td
							><td
								><p class="font-bold">{shipment.route}</p>
								<p class="cs-muted mt-1 text-xs">{shipment.client}</p></td
							><td>{shipment.partners}</td><td class="cs-money font-bold">{shipment.funded}</td><td
								><StatusBadge label={shipment.status} tone={shipment.tone} /></td
							><td
								><p class="text-sm font-semibold">{shipment.milestone}</p>
								<p class="cs-muted mt-1 text-xs">Due {shipment.due}</p></td
							><td
								><button
									class="cs-muted rounded-lg p-2"
									aria-label={`Open ${shipment.id}`}
									onclick={() => (query = shipment.id)}><Icon name="more" size={16} /></button
								></td
							></tr
						>{/each}</tbody
				>
			</table>
		</div>
		<div class="cs-muted mt-4 flex items-center justify-between text-sm">
			<span
				>Showing {filtered.length} of 48 shipments{selected.length
					? ` · ${selected.length} selected`
					: ''}</span
			>
			<div class="flex gap-2">
				<button
					class="cs-btn cs-btn-secondary"
					disabled={page === 1}
					onclick={() => (page = Math.max(1, page - 1))}>Previous</button
				><button class="cs-btn cs-btn-secondary" onclick={() => (page += 1)}>Next</button>
			</div>
		</div>
	</section>
</AppShell>
