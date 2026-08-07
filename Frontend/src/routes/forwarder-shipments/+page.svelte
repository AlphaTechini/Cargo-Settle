<script lang="ts">
	import { page } from '$app/state';
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import {
		formatDate,
		formatFundedAmount,
		getWorkspaceMembers,
		listShipments,
		shipmentStatusLabel,
		shipmentStatusTone,
		type ShipmentListItem,
		type ShipmentStatus,
		type WorkspaceMember
	} from '$lib/shipments';

	let query = $state('');
	let activeFilter = $state<ShipmentStatus | 'all'>('all');
	let shipments = $state<ShipmentListItem[]>([]);
	let members = $state<WorkspaceMember[]>([]);
	let cursor = $state<string | null>(null);
	let cursorHistory = $state<(string | null)[]>([]);
	let nextCursor = $state<string | null>(null);
	let loading = $state(true);
	let error = $state('');
	let loadedWorkspaceId = $state('');
	let workspaceId = $derived(page.data.activeWorkspace?.id ?? '');
	let filtered = $derived(shipments);
	let inTransitCount = $derived(
		shipments.filter((shipment) => shipment.status === 'in_transit').length
	);
	let completedCount = $derived(
		shipments.filter((shipment) => shipment.status === 'completed').length
	);
	let exceptionCount = $derived(
		shipments.filter((shipment) => shipment.status === 'cancelled').length
	);

	$effect(() => {
		if (!workspaceId) {
			loading = false;
			error = 'Sign in and select a workspace to view shipments.';
			return;
		}
		if (workspaceId === loadedWorkspaceId) return;
		loadedWorkspaceId = workspaceId;
		void loadMembers();
		void resetAndLoad();
	});

	async function loadMembers() {
		try {
			members = (await getWorkspaceMembers(workspaceId)).members;
		} catch {
			members = [];
		}
	}

	async function loadPage(next: string | null) {
		loading = true;
		error = '';
		try {
			const result = await listShipments({
				search: query.trim() || undefined,
				status: activeFilter === 'all' ? undefined : activeFilter,
				cursor: next,
				limit: 25
			});
			shipments = result.items;
			nextCursor = result.nextCursor;
			cursor = next;
		} catch (requestError) {
			error = requestError instanceof Error ? requestError.message : 'Unable to load shipments';
		} finally {
			loading = false;
		}
	}

	async function resetAndLoad() {
		cursorHistory = [];
		await loadPage(null);
	}

	async function goNext() {
		if (!nextCursor) return;
		const previous = cursor;
		await loadPage(nextCursor);
		if (!error) cursorHistory = [...cursorHistory, previous];
	}

	async function goPrevious() {
		if (!cursorHistory.length) return;
		const previous = cursorHistory.at(-1) ?? null;
		await loadPage(previous);
		if (!error) cursorHistory = cursorHistory.slice(0, -1);
	}

	function memberName(userId: string) {
		return members.find((member) => member.userId === userId)?.displayName ?? 'Workspace member';
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
				<select class="cs-filter" bind:value={activeFilter} onchange={() => resetAndLoad()}>
					<option value="all">All statuses</option>
					<option value="draft">Draft</option>
					<option value="funded">Funded</option>
					<option value="in_transit">In transit</option>
					<option value="completed">Completed</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</div>
			<div class="relative">
				<Icon
					name="search"
					size={16}
					className="absolute left-3 top-1/2 -translate-y-1/2 cs-muted"
				/><input
					class="cs-input !w-[260px] !pl-9"
					bind:value={query}
					onkeydown={(event) => event.key === 'Enter' && resetAndLoad()}
					placeholder="Search shipments"
				/>
			</div>
		</div>
		<div class="mb-5 grid gap-4 md:grid-cols-4">
			<MetricCard
				label="All shipments"
				value={String(shipments.length)}
				note="Current workspace page"
				icon="container"
			/><MetricCard
				label="In transit"
				value={String(inTransitCount)}
				note="Current page"
				icon="ship"
			/><MetricCard
				label="Completed"
				value={String(completedCount)}
				note="Current page"
				icon="check-circle"
			/><MetricCard
				label="Exceptions"
				value={String(exceptionCount)}
				note="Cancelled shipments"
				icon="alert"
			/>
		</div>
		{#if error}<div class="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-900">{error}</div>{/if}
		<div class="cs-card overflow-x-auto">
			<table class="cs-table min-w-[1100px]">
				<thead>
					<tr>
						<th>Shipment</th><th>Route / client</th><th>Funded value</th><th>Status</th><th
							>Updated</th
						>
					</tr>
				</thead>
				<tbody>
					{#if loading}
						<tr><td colspan="5" class="cs-muted p-8 text-center">Loading shipments...</td></tr>
					{:else if !filtered.length}
						<tr
							><td colspan="5" class="cs-muted p-8 text-center"
								>No shipments match the current filters.</td
							></tr
						>
					{:else}
						{#each filtered as shipment (shipment.id)}
							<tr>
								<td
									><a
										href={`/forwarder-shipment-detail?id=${shipment.id}`}
										class="font-extrabold text-teal-700">{shipment.reference}</a
									></td
								>
								<td>
									<p class="font-bold">{shipment.origin} -> {shipment.destination}</p>
									<p class="cs-muted mt-1 text-xs">
										{memberName(shipment.shipperId)} · {shipment.mode}
									</p>
								</td>
								<td class="cs-money font-bold">
									{#if shipment.fundedAmount && shipment.fundedCurrency}{formatFundedAmount(
											shipment.fundedAmount,
											shipment.fundedCurrency
										)}{/if}
								</td>
								<td
									><StatusBadge
										label={shipmentStatusLabel(shipment.status)}
										tone={shipmentStatusTone(shipment.status)}
									/></td
								>
								<td><p class="text-sm font-semibold">{formatDate(shipment.updatedAt)}</p></td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
		<div class="cs-muted mt-4 flex items-center justify-between text-sm">
			<span>Showing {filtered.length} shipments</span>
			<div class="flex gap-2">
				<button
					class="cs-btn cs-btn-secondary"
					disabled={!cursorHistory.length || loading}
					onclick={goPrevious}>Previous</button
				><button class="cs-btn cs-btn-secondary" disabled={!nextCursor || loading} onclick={goNext}
					>Next</button
				>
			</div>
		</div>
	</section>
</AppShell>
