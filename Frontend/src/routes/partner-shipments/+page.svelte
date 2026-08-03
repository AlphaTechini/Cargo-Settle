<script lang="ts">
	import { page } from '$app/state';
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import {
		addDocumentMetadata,
		formatDate,
		getShipment,
		listShipments,
		milestoneStatusLabel,
		milestoneStatusTone,
		shipmentStatusLabel,
		shipmentStatusTone,
		updateMilestone,
		type ShipmentDetail,
		type ShipmentListItem
	} from '$lib/shipments';

	type Modal = 'view' | 'evidence' | 'invoice' | 'review' | null;
	type SelectedFile = { name: string; type: string; size: number };

	let query = $state('');
	let modal = $state<Modal>(null);
	let fileName = $state('');
	let selectedFile = $state<SelectedFile | null>(null);
	let evidenceNote = $state('');
	let actionState = $state<Record<string, string>>({});
	let assigned = $state<ShipmentListItem[]>([]);
	let selectedId = $state('');
	let selectedDetail = $state<ShipmentDetail | null>(null);
	let loading = $state(true);
	let detailLoading = $state(false);
	let saving = $state(false);
	let error = $state('');
	let loadedWorkspaceId = $state('');
	let workspaceId = $derived(page.data.activeWorkspace?.id ?? '');
	let filtered = $derived(assigned);
	let selected = $derived(
		selectedDetail ?? assigned.find((item) => item.id === selectedId) ?? null
	);

	$effect(() => {
		if (!workspaceId) {
			loading = false;
			error = 'Sign in and select a workspace to view shipments.';
			return;
		}
		if (workspaceId === loadedWorkspaceId) return;
		loadedWorkspaceId = workspaceId;
		void loadShipments();
	});

	async function loadShipments() {
		loading = true;
		error = '';
		try {
			assigned = (await listShipments({ search: query.trim() || undefined, limit: 50 })).items;
		} catch (requestError) {
			error =
				requestError instanceof Error ? requestError.message : 'Unable to load assigned shipments';
		} finally {
			loading = false;
		}
	}

	async function openShipment(id: string, nextModal: Modal = 'view') {
		selectedId = id;
		selectedDetail = null;
		modal = nextModal;
		detailLoading = true;
		try {
			selectedDetail = (await getShipment(id)).shipment;
		} catch (requestError) {
			error =
				requestError instanceof Error ? requestError.message : 'Unable to load shipment details';
		} finally {
			detailLoading = false;
		}
	}

	function closeModal() {
		modal = null;
		selectedId = '';
		selectedDetail = null;
		fileName = '';
		selectedFile = null;
		evidenceNote = '';
	}

	async function confirmAction() {
		if (!selectedDetail || modal === 'view') return;
		if (modal === 'review') {
			actionState = { ...actionState, [selectedDetail.id]: 'Review opened' };
			closeModal();
			return;
		}
		if (!selectedFile) {
			error = 'Choose a file before submitting it.';
			return;
		}
		const nextMilestone = selectedDetail.milestones.find(
			(milestone) => !['completed', 'skipped'].includes(milestone.status)
		);
		if (!nextMilestone) {
			error = 'There is no open milestone for this shipment.';
			return;
		}
		saving = true;
		error = '';
		try {
			await addDocumentMetadata(selectedDetail.id, {
				fileName: selectedFile.name,
				storageKey: `shipment/${selectedDetail.id}/${selectedFile.name}`,
				mimeType: selectedFile.type || 'application/octet-stream',
				byteSize: selectedFile.size,
				milestoneId: nextMilestone.id
			});
			const milestone = await updateMilestone(selectedDetail.id, nextMilestone.id, 'in_progress');
			selectedDetail = {
				...selectedDetail,
				milestones: selectedDetail.milestones.map((item) =>
					item.id === milestone.milestone.id
						? { ...item, status: milestone.milestone.status }
						: item
				)
			};
			actionState = {
				...actionState,
				[selectedDetail.id]: modal === 'evidence' ? 'Evidence submitted' : 'Invoice submitted'
			};
			closeModal();
		} catch (requestError) {
			error =
				requestError instanceof Error ? requestError.message : 'Unable to submit shipment evidence';
		} finally {
			saving = false;
		}
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
					onkeydown={(event) => event.key === 'Enter' && loadShipments()}
					placeholder="Search assigned work"
				/>
			</div>
		</div>
		{#if error}<div class="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-900">{error}</div>{/if}
		<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#if loading}<div class="cs-card cs-muted p-8 text-center md:col-span-2 xl:col-span-3">
					Loading assigned shipments...
				</div>{:else if !filtered.length}<div
					class="cs-card cs-muted p-8 text-center md:col-span-2 xl:col-span-3"
				>
					No assigned shipments found.
				</div>{:else}{#each filtered as item (item.id)}<div class="cs-card p-5">
						<div class="flex justify-between">
							<span class="text-xs font-bold text-teal-700">{item.reference}</span><StatusBadge
								label={actionState[item.id] ?? shipmentStatusLabel(item.status)}
								tone={actionState[item.id] ? 'success' : shipmentStatusTone(item.status)}
							/>
						</div>
						<h3 class="mt-4 text-lg font-extrabold">{item.origin} -> {item.destination}</h3>
						<p class="cs-muted mt-1 text-sm">{item.mode} · Created {formatDate(item.createdAt)}</p>
						<div class="mt-5 flex justify-between rounded-xl bg-slate-50 p-4">
							<div>
								<p class="cs-muted text-xs">Shipment status</p>
								<p class="mt-1 text-xl font-extrabold">{shipmentStatusLabel(item.status)}</p>
							</div>
							<div class="text-right">
								<p class="cs-muted text-xs">Reference</p>
								<p class="mt-1 font-bold">{item.reference}</p>
							</div>
						</div>
						<div class="mt-5 flex gap-2">
							<button class="cs-btn cs-btn-secondary flex-1" onclick={() => openShipment(item.id)}
								>View shipment</button
							><button
								class="cs-btn cs-btn-primary flex-1"
								disabled={saving || Boolean(actionState[item.id]) || item.status === 'completed'}
								onclick={() => openShipment(item.id, 'evidence')}
								>{actionState[item.id] ?? 'Submit evidence'}</button
							>
						</div>
					</div>{/each}{/if}
		</div>
	</section>
</AppShell>

<DemoModal
	open={modal !== null}
	title={modal === 'view'
		? `${selected?.reference ?? ''} shipment details`
		: modal === 'evidence'
			? 'Submit milestone evidence'
			: modal === 'invoice'
				? 'Upload invoice'
				: 'Review submission'}
	description="Submit metadata and milestone updates through the live shipment workflow."
	confirmLabel={modal === 'evidence'
		? 'Submit evidence'
		: modal === 'invoice'
			? 'Upload invoice'
			: 'Confirm'}
	showConfirm={modal !== 'view'}
	onClose={closeModal}
	onConfirm={confirmAction}
>
	{#if detailLoading}<p class="cs-muted">
			Loading shipment details...
		</p>{:else if selectedDetail && modal === 'view'}<div class="space-y-4">
			<div>
				<p class="text-2xl font-extrabold">
					{selectedDetail.origin} -> {selectedDetail.destination}
				</p>
				<p class="cs-muted mt-1 text-sm">
					{selectedDetail.mode} · {shipmentStatusLabel(selectedDetail.status)}
				</p>
			</div>
			<div class="rounded-xl bg-slate-50 p-4">
				<p class="cs-muted text-xs">Milestones</p>
				<div class="mt-3 space-y-2">
					{#each selectedDetail.milestones as milestone (milestone.id)}<div
							class="flex items-center justify-between gap-3"
						>
							<span>{milestone.label}</span><StatusBadge
								label={milestoneStatusLabel(milestone.status)}
								tone={milestoneStatusTone(milestone.status)}
							/>
						</div>{/each}
				</div>
			</div>
		</div>{:else if modal === 'evidence' || modal === 'invoice'}<div class="space-y-4">
			<div>
				<label class="cs-label" for="partner-file">Evidence file</label><input
					id="partner-file"
					class="cs-input"
					type="file"
					onchange={(event) => {
						const file = event.currentTarget.files?.[0];
						if (file) {
							selectedFile = { name: file.name, type: file.type, size: file.size };
							fileName = file.name;
						}
					}}
				/>
			</div>
			<div>
				<label class="cs-label" for="evidence-note">Note</label><textarea
					id="evidence-note"
					class="cs-input h-24"
					bind:value={evidenceNote}
					placeholder="Add delivery context..."></textarea>
			</div>
			{#if fileName}<p class="cs-muted text-xs">Selected file: {fileName}</p>{/if}
		</div>{:else}<div class="rounded-xl bg-purple-50 p-4 text-sm text-purple-900">
			<b>Submission under review</b>
			<p class="mt-1">The live shipment record is ready for forwarder review.</p>
		</div>{/if}
</DemoModal>
