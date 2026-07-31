<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let query = $state('');
	let selectedId = $state('');
	const rows = [
		{
			id: 'SHP-2048',
			route: 'New York -> Rotterdam',
			forwarder: 'Northstar Freight',
			value: '$24,800',
			status: 'In transit',
			tone: 'info',
			progress: 68
		},
		{
			id: 'SHP-2089',
			route: 'Miami -> Antwerp',
			forwarder: 'Northstar Freight',
			value: '$17,200',
			status: 'Awaiting funding',
			tone: 'warning',
			progress: 0
		},
		{
			id: 'SHP-2038',
			route: 'Lagos -> Durban',
			forwarder: 'Harborline Forwarding',
			value: '$38,600',
			status: 'Completed',
			tone: 'success',
			progress: 100
		},
		{
			id: 'SHP-2027',
			route: 'Shanghai -> Seattle',
			forwarder: 'Northstar Freight',
			value: '$42,900',
			status: 'Milestone review',
			tone: 'purple',
			progress: 54
		}
	];
	let filtered = $derived(
		rows.filter((row) =>
			`${row.id} ${row.route} ${row.forwarder}`.toLowerCase().includes(query.toLowerCase())
		)
	);
	let selected = $derived(rows.find((row) => row.id === selectedId));
</script>

<AppShell
	title="Shipments"
	subtitle="Commercial shipment status and settlement progress"
	active="shipments"
	role="shipper"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="mb-5 flex flex-wrap justify-between gap-3">
			<div class="flex gap-2">
				<button class="cs-filter">Status</button><button class="cs-filter">Forwarder</button><button
					class="cs-filter">Date</button
				>
			</div>
			<div class="relative">
				<Icon
					name="search"
					size={16}
					className="absolute left-3 top-1/2 -translate-y-1/2 cs-muted"
				/><input
					class="cs-input !w-[280px] !pl-9"
					bind:value={query}
					placeholder="Search shipments"
				/>
			</div>
		</div>
		<div class="cs-card overflow-x-auto">
			<table class="cs-table min-w-[900px]">
				<thead
					><tr
						><th>Shipment</th><th>Route / forwarder</th><th>Funded value</th><th>Status</th><th
							>Settlement progress</th
						><th></th></tr
					></thead
				><tbody
					>{#each filtered as row (row.id)}<tr
							><td
								><button class="font-extrabold text-teal-700" onclick={() => (selectedId = row.id)}
									>{row.id}</button
								></td
							><td
								><p class="font-bold">{row.route}</p>
								<p class="cs-muted mt-1 text-xs">{row.forwarder}</p></td
							><td class="font-extrabold">{row.value}</td><td
								><StatusBadge label={row.status} tone={row.tone} /></td
							><td
								><div class="flex items-center gap-3">
									<div class="cs-progress w-28">
										<span style={`width: ${row.progress}%`}></span>
									</div>
									<b class="text-xs">{row.progress}%</b>
								</div></td
							><td
								><button class="cs-muted" onclick={() => (selectedId = row.id)}
									><Icon name="chevron-right" size={16} /></button
								></td
							></tr
						>{/each}</tbody
				>
			</table>
		</div>
	</section>
</AppShell>

<DemoModal
	open={selected !== undefined}
	title={selected?.id ?? 'Shipment details'}
	description="Review the local shipment record and funding allocation."
	showConfirm={false}
	onClose={() => (selectedId = '')}
	>{#if selected}<div class="space-y-4">
			<div>
				<p class="text-2xl font-extrabold">{selected.route}</p>
				<p class="cs-muted mt-1 text-sm">Managed by {selected.forwarder}</p>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-xl bg-slate-50 p-4">
					<p class="cs-muted text-xs">Funded value</p>
					<p class="mt-1 font-extrabold">{selected.value}</p>
				</div>
				<div class="rounded-xl bg-slate-50 p-4">
					<p class="cs-muted text-xs">Settlement progress</p>
					<p class="mt-1 font-extrabold">{selected.progress}%</p>
				</div>
			</div>
			<div class="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
				<b>{selected.status}</b>
				<p class="mt-1">
					Next milestone: customs evidence review. Partner allocation is 68% settled.
				</p>
			</div>
		</div>{/if}</DemoModal
>
