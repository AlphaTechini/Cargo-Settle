<script lang="ts">
	import type { ShipperDashboardData } from '$lib/dashboard';

	let { counts } = $props<{ counts: ShipperDashboardData['statusCounts'] }>();

	const statuses = [
		{ key: 'draft', label: 'Draft', tone: 'border-t-slate-400' },
		{ key: 'funded', label: 'Funded', tone: 'border-t-purple-500' },
		{ key: 'in_transit', label: 'In transit', tone: 'border-t-blue-500' },
		{ key: 'completed', label: 'Completed', tone: 'border-t-emerald-500' },
		{ key: 'cancelled', label: 'Cancelled', tone: 'border-t-red-500' }
	] as const;
</script>

<div class="cs-card p-5">
	<div>
		<h2 class="font-extrabold">Shipment status</h2>
		<p class="cs-muted mt-1 text-xs">Current shipment counts by status</p>
	</div>
	<div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
		{#each statuses as status (status.key)}
			<div class={`cs-card-sm border-t-4 p-4 ${status.tone}`}>
				<p class="cs-muted text-xs">{status.label}</p>
				<p class="cs-kpi mt-2 text-2xl font-extrabold">{counts[status.key]}</p>
			</div>
		{/each}
	</div>
</div>
