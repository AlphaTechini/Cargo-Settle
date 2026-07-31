<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let query = $state('');
	let selectedId = $state('');
	let modal = $state<'view' | 'evidence' | 'invoice' | 'review' | null>(null);
	let fileName = $state('');
	let evidenceNote = $state('');
	let actionState = $state<Record<string, string>>({});
	const assigned = [
		{
			id: 'SHP-2048',
			route: 'New York -> Rotterdam',
			work: 'Final delivery · Due Jul 30',
			amount: '$10,000',
			status: 'Evidence required',
			tone: 'warning',
			action: 'Submit evidence'
		},
		{
			id: 'SHP-2076',
			route: 'Dubai -> Nairobi',
			work: 'Container transport · Due Aug 3',
			amount: '$4,600',
			status: 'Invoice required',
			tone: 'danger',
			action: 'Upload invoice'
		},
		{
			id: 'SHP-2059',
			route: 'Shanghai -> Hamburg',
			work: 'Final-mile delivery · Under review',
			amount: 'EURC 3,800',
			status: 'Submitted',
			tone: 'purple',
			action: 'View review status'
		}
	];
	let filtered = $derived(
		assigned.filter((item) =>
			`${item.id} ${item.route} ${item.work}`.toLowerCase().includes(query.toLowerCase())
		)
	);
	let selected = $derived(assigned.find((item) => item.id === selectedId));
	function confirmAction() {
		if (!selected) return;
		actionState = {
			...actionState,
			[selected.id]:
				modal === 'evidence'
					? 'Evidence submitted'
					: modal === 'invoice'
						? 'Invoice uploaded'
						: 'Review opened'
		};
		modal = null;
	}
</script>

<AppShell
	title="Assigned shipments"
	subtitle="Milestones, evidence, and payment obligations"
	active="shipments"
	role="partner"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="mb-5 flex flex-wrap justify-between gap-3">
			<div class="flex gap-2">
				<button class="cs-filter">Status</button><button class="cs-filter">Milestone</button><button
					class="cs-filter">Due date</button
				>
			</div>
			<div class="relative">
				<Icon
					name="search"
					size={16}
					className="absolute left-3 top-1/2 -translate-y-1/2 cs-muted"
				/><input
					class="cs-input !w-[270px] !pl-9"
					bind:value={query}
					placeholder="Search assigned work"
				/>
			</div>
		</div>
		<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each filtered as item (item.id)}<div class="cs-card p-5">
					<div class="flex justify-between">
						<span class="text-xs font-bold text-teal-700">{item.id}</span><StatusBadge
							label={actionState[item.id] ?? item.status}
							tone={actionState[item.id] ? 'success' : item.tone}
						/>
					</div>
					<h3 class="mt-4 text-lg font-extrabold">{item.route}</h3>
					<p class="cs-muted mt-1 text-sm">{item.work}</p>
					<div class="mt-5 flex justify-between rounded-xl bg-slate-50 p-4">
						<div>
							<p class="cs-muted text-xs">
								{item.action === 'Submit evidence'
									? 'Earned amount'
									: item.action === 'Upload invoice'
										? 'Expected amount'
										: 'Obligation'}
							</p>
							<p class="mt-1 text-xl font-extrabold">{item.amount}</p>
						</div>
						<div class="text-right">
							<p class="cs-muted text-xs">Currency</p>
							<p class="mt-1 font-bold">{item.amount.includes('EURC') ? 'EURC' : 'USDC'}</p>
						</div>
					</div>
					<div class="mt-5 flex gap-2">
						<button
							class="cs-btn cs-btn-secondary flex-1"
							onclick={() => {
								selectedId = item.id;
								modal = 'view';
							}}>View shipment</button
						><button
							class="cs-btn cs-btn-primary flex-1"
							onclick={() => {
								selectedId = item.id;
								modal =
									item.action === 'Submit evidence'
										? 'evidence'
										: item.action === 'Upload invoice'
											? 'invoice'
											: 'review';
							}}
							disabled={Boolean(actionState[item.id])}>{actionState[item.id] ?? item.action}</button
						>
					</div>
				</div>{/each}
		</div>
	</section>
</AppShell>

<DemoModal
	open={modal !== null}
	title={modal === 'view'
		? `${selected?.id} shipment details`
		: modal === 'evidence'
			? 'Submit milestone evidence'
			: modal === 'invoice'
				? 'Upload invoice'
				: 'Review submission'}
	description="This local partner workflow updates the card state without uploading or sending data."
	confirmLabel={modal === 'evidence'
		? 'Submit evidence'
		: modal === 'invoice'
			? 'Upload invoice'
			: 'Confirm'}
	showConfirm={modal !== 'view'}
	onClose={() => (modal = null)}
	onConfirm={confirmAction}
	>{#if selected && modal === 'view'}<div class="space-y-4">
			<div>
				<p class="text-2xl font-extrabold">{selected.route}</p>
				<p class="cs-muted mt-1 text-sm">{selected.work}</p>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-xl bg-slate-50 p-4">
					<p class="cs-muted text-xs">Expected value</p>
					<p class="mt-1 font-extrabold">{selected.amount}</p>
				</div>
				<div class="rounded-xl bg-slate-50 p-4">
					<p class="cs-muted text-xs">Current status</p>
					<p class="mt-1 font-extrabold">{actionState[selected.id] ?? selected.status}</p>
				</div>
			</div>
		</div>{:else if modal === 'evidence'}<div class="space-y-4">
			<div>
				<label class="cs-label" for="evidence-file">Evidence file</label><input
					id="evidence-file"
					class="cs-input"
					type="file"
					onchange={(event) => (fileName = event.currentTarget.files?.[0]?.name ?? '')}
				/>
			</div>
			<div>
				<label class="cs-label" for="evidence-note">Note</label><textarea
					id="evidence-note"
					class="cs-input h-24"
					bind:value={evidenceNote}
					placeholder="Add delivery context..."></textarea>
			</div>
		</div>{:else if modal === 'invoice'}<div class="space-y-4">
			<label class="cs-label" for="invoice-file">Invoice file</label><input
				id="invoice-file"
				class="cs-input"
				type="file"
				onchange={(event) => (fileName = event.currentTarget.files?.[0]?.name ?? '')}
			/>
			<div class="rounded-xl bg-slate-50 p-4 text-sm">
				<div class="flex justify-between">
					<span>Expected amount</span><b>{selected?.amount}</b>
				</div>
				<div class="mt-2 flex justify-between">
					<span>Currency</span><b>{selected?.amount.includes('EURC') ? 'EURC' : 'USDC'}</b>
				</div>
			</div>
		</div>{:else}<div class="rounded-xl bg-purple-50 p-4 text-sm text-purple-900">
			<b>Submission under review</b>
			<p class="mt-1">SHP-2059 has been submitted and is waiting for forwarder review.</p>
		</div>{/if}{#if fileName}<p class="cs-muted mt-3 text-xs">
			Selected file: {fileName}
		</p>{/if}</DemoModal
>
