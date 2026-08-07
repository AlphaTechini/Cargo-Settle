<script lang="ts">
	import { formatCurrencyAmount } from '$lib/dashboard';
	import type { OperationalObligation } from '$lib/operations';
	import StatusBadge from './StatusBadge.svelte';

	let { obligation, showPartner = true } = $props<{
		obligation: OperationalObligation;
		showPartner?: boolean;
	}>();

	function formatDate(value: string | null) {
		if (!value) return '';
		return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
			new Date(value)
		);
	}

	const statusTone: Record<OperationalObligation['status'], string> = {
		pending: 'warning',
		earned: 'info',
		approved: 'purple',
		paid: 'success',
		cancelled: 'neutral'
	};

	function getStatusTone(status: OperationalObligation['status']) {
		return statusTone[status];
	}
</script>

<div class="flex flex-wrap items-center justify-between gap-3 py-4">
	<div>
		<p class="font-bold">{obligation.shipmentReference}</p>
		<p class="cs-muted mt-1 text-xs">
			{#if showPartner && obligation.partnerName}{obligation.partnerName} ·
			{/if}{obligation.dueAt ? `Due ${formatDate(obligation.dueAt)}` : 'No due date'}
		</p>
	</div>
	<div class="text-right">
		<p class="font-extrabold">{formatCurrencyAmount(obligation.amount, obligation.currency)}</p>
		<StatusBadge label={obligation.status} tone={getStatusTone(obligation.status)} />
	</div>
</div>
