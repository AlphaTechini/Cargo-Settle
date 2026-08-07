<script lang="ts">
	import { page } from '$app/state';
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import {
		formatFundedAmount,
		getShipment,
		getWorkspaceMembers,
		listShipments,
		milestoneStatusLabel,
		milestoneStatusTone,
		shipmentProgress,
		shipmentStatusLabel,
		shipmentStatusTone,
		type ShipmentDetail,
		type ShipmentListItem,
		type WorkspaceMember
	} from '$lib/shipments';

	let query = $state('');
	let selectedId = $state('');
	let rows = $state<ShipmentListItem[]>([]);
	let members = $state<WorkspaceMember[]>([]);
	let selectedDetail = $state<ShipmentDetail | null>(null);
	let loading = $state(true);
	let detailLoading = $state(false);
	let error = $state('');
	let loadedWorkspaceId = $state('');
	let workspaceId = $derived(page.data.activeWorkspace?.id ?? '');
	let filtered = $derived(rows);
	let selected = $derived(selectedDetail ?? rows.find((row) => row.id === selectedId) ?? null);

	$effect(() => {
		if (!workspaceId) {
			loading = false;
			error = 'Select a workspace to view shipments.';
			return;
		}
		if (workspaceId === loadedWorkspaceId) return;
		loadedWorkspaceId = workspaceId;
		void loadMembers();
		void loadShipments();
	});

	async function loadMembers() {
		try {
			members = (await getWorkspaceMembers(workspaceId)).members;
		} catch {
			members = [];
		}
	}

	async function loadShipments() {
		loading = true;
		error = '';
		try {
			rows = (await listShipments({ search: query.trim() || undefined, limit: 50 })).items;
		} catch (requestError) {
			error = requestError instanceof Error ? requestError.message : 'Unable to load shipments';
		} finally {
			loading = false;
		}
	}

	async function openShipment(id: string) {
		selectedId = id;
		selectedDetail = null;
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

	function closeDetails() {
		selectedId = '';
		selectedDetail = null;
	}

	function memberName(userId: string) {
		return members.find((member) => member.userId === userId)?.displayName ?? 'Workspace member';
	}
</script>

<AppShell
	title="Shipments"
	subtitle="Commercial shipment status and settlement progress"
	active="shipments"
	role="shipper"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="mb-5 flex justify-end">
			<div class="relative">
				<Icon
					name="search"
					size={16}
					className="absolute left-3 top-1/2 -translate-y-1/2 cs-muted"
				/><input
					class="cs-input !w-[280px] !pl-9"
					bind:value={query}
					onkeydown={(event) => event.key === 'Enter' && loadShipments()}
					placeholder="Search shipments"
				/>
			</div>
		</div>
		{#if error}<div class="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-900">{error}</div>{/if}
		<div class="cs-card overflow-x-auto">
			<table class="cs-table min-w-[900px]">
				<thead
					><tr
						><th>Shipment</th><th>Route / forwarder</th><th>Funded value</th><th>Status</th><th
							>Shipment progress</th
						><th></th></tr
					></thead
				>
				<tbody>
					{#if loading}<tr
							><td colspan="6" class="cs-muted p-8 text-center">Loading shipments...</td></tr
						>{:else if !filtered.length}<tr
							><td colspan="6" class="cs-muted p-8 text-center">No shipments found.</td></tr
						>{:else}{#each filtered as row (row.id)}<tr>
								<td
									><button class="font-extrabold text-teal-700" onclick={() => openShipment(row.id)}
										>{row.reference}</button
									></td
								>
								<td
									><p class="font-bold">{row.origin} -> {row.destination}</p>
									<p class="cs-muted mt-1 text-xs">
										{memberName(row.freightForwarderId)} · {row.mode}
									</p></td
								>
								<td class="font-extrabold"
									>{#if row.fundedAmount && row.fundedCurrency}{formatFundedAmount(
											row.fundedAmount,
											row.fundedCurrency
										)}{/if}</td
								>
								<td
									><StatusBadge
										label={shipmentStatusLabel(row.status)}
										tone={shipmentStatusTone(row.status)}
									/></td
								>
								<td
									><div class="flex items-center gap-3">
										<div class="cs-progress w-28">
											<span style={`width: ${shipmentProgress(row.status)}%`}></span>
										</div>
										<b class="text-xs">{shipmentProgress(row.status)}%</b>
									</div></td
								>
								<td
									><button
										class="cs-muted"
										aria-label={`Open ${row.reference}`}
										onclick={() => openShipment(row.id)}
										><Icon name="chevron-right" size={16} /></button
									></td
								>
							</tr>{/each}{/if}
				</tbody>
			</table>
		</div>
	</section>
</AppShell>

<DemoModal
	open={selectedId !== ''}
	title={selected?.reference ?? 'Shipment details'}
	description="Review the live shipment record and milestone progress."
	showConfirm={false}
	onClose={closeDetails}
>
	{#if detailLoading}<p class="cs-muted">
			Loading shipment details...
		</p>{:else if selectedDetail}<div class="space-y-4">
			<div>
				<p class="text-2xl font-extrabold">
					{selectedDetail.origin} -> {selectedDetail.destination}
				</p>
				<p class="cs-muted mt-1 text-sm">
					Managed by {memberName(selectedDetail.freightForwarderId)} · {selectedDetail.mode}
				</p>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-xl bg-slate-50 p-4">
					<p class="cs-muted text-xs">Funded value</p>
					{#if selectedDetail.fundedAmount && selectedDetail.fundedCurrency}<p
							class="mt-1 font-extrabold"
						>
							{formatFundedAmount(selectedDetail.fundedAmount, selectedDetail.fundedCurrency)}
						</p>{/if}
				</div>
				<div class="rounded-xl bg-slate-50 p-4">
					<p class="cs-muted text-xs">Status</p>
					<p class="mt-1 font-extrabold">{shipmentStatusLabel(selectedDetail.status)}</p>
				</div>
			</div>
			<div class="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
				<b>Milestones</b>{#if selectedDetail.milestones.length}<div class="mt-3 space-y-2">
						{#each selectedDetail.milestones as milestone (milestone.id)}<div
								class="flex items-center justify-between gap-3"
							>
								<span>{milestone.label}</span><StatusBadge
									label={milestoneStatusLabel(milestone.status)}
									tone={milestoneStatusTone(milestone.status)}
								/>
							</div>{/each}
					</div>{:else}<p class="mt-1">No milestones recorded.</p>{/if}
			</div>
		</div>{:else}<p class="cs-muted">No shipment details loaded.</p>{/if}
</DemoModal>
