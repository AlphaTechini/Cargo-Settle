<script lang="ts">
	import { formatCurrencyAmount, formatShipmentStatus } from '$lib/dashboard';
	import type { PartnerWorkItem } from '$lib/operations';
	import Icon from './Icon.svelte';
	import StatusBadge from './StatusBadge.svelte';

	let { item } = $props<{ item: PartnerWorkItem }>();

	const statusTone: Record<PartnerWorkItem['status'], string> = {
		draft: 'neutral',
		funded: 'purple',
		in_transit: 'info',
		completed: 'success',
		cancelled: 'danger'
	};

	function getStatusTone(status: PartnerWorkItem['status']) {
		return statusTone[status];
	}
</script>

<div class="flex items-center gap-4 py-4">
	<span class="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
		<Icon name="truck" />
	</span>
	<div class="min-w-0">
		<p class="truncate font-bold">{item.shipmentReference} · {item.origin} -> {item.destination}</p>
		<p class="cs-muted mt-1 text-xs">
			{item.mode}{#if item.nextMilestone}
				· {item.nextMilestone}{/if}
		</p>
	</div>
	<div class="ml-auto shrink-0 text-right">
		{#if item.obligation}
			<p class="font-extrabold">
				{formatCurrencyAmount(item.obligation.amount, item.obligation.currency)}
			</p>
		{/if}
		<StatusBadge label={formatShipmentStatus(item.status)} tone={getStatusTone(item.status)} />
	</div>
</div>
