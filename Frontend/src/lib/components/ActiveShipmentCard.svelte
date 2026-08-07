<script lang="ts">
	import type { DashboardShipment } from '$lib/dashboard';
	import { formatCurrencyAmount, formatShipmentStatus } from '$lib/dashboard';
	import Icon from './Icon.svelte';
	import StatusBadge from './StatusBadge.svelte';

	let { shipment } = $props<{ shipment: DashboardShipment }>();

	const statusTone: Record<DashboardShipment['status'], string> = {
		draft: 'neutral',
		funded: 'purple',
		in_transit: 'info',
		completed: 'success',
		cancelled: 'danger'
	};

	function getStatusTone(status: DashboardShipment['status']) {
		return statusTone[status];
	}
</script>

<div class="flex items-center gap-4 py-4">
	<span class="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
		<Icon name="ship" />
	</span>
	<div class="min-w-0">
		<p class="truncate font-bold">
			{shipment.reference} · {shipment.origin} -> {shipment.destination}
		</p>
		<p class="cs-muted mt-1 text-xs">{shipment.mode}</p>
	</div>
	<div class="ml-auto shrink-0 text-right">
		{#if shipment.fundedAmount && shipment.fundedCurrency}
			<p class="font-extrabold">
				{formatCurrencyAmount(shipment.fundedAmount, shipment.fundedCurrency)}
			</p>
		{/if}
		<StatusBadge
			label={formatShipmentStatus(shipment.status)}
			tone={getStatusTone(shipment.status)}
		/>
	</div>
</div>
