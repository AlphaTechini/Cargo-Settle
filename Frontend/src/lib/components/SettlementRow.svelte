<script lang="ts">
	import type { ShipperSettlementRow } from '$lib/settlements';
	import StatusBadge from './StatusBadge.svelte';
	import { formatCurrencyAmount } from '$lib/dashboard';

	let { row }: { row: ShipperSettlementRow } = $props();

	function formatDate(value: string | null) {
		if (!value) return '';
		return new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(value));
	}

	function statusLabel(status: ShipperSettlementRow['status']) {
		return status.replace('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase());
	}

	function statusTone(status: ShipperSettlementRow['status']) {
		return {
			pending: 'warning',
			submitted: 'info',
			confirmed: 'success',
			failed: 'danger',
			cancelled: 'neutral'
		}[status];
	}
</script>

<tr>
	<td>{formatDate(row.confirmedAt ?? row.createdAt)}</td>
	<td>
		<b>{row.shipment.reference}</b><br />
		<span class="cs-muted text-xs">{row.shipment.origin} -> {row.shipment.destination}</span>
	</td>
	<td>{row.forwarder}</td>
	<td class="font-extrabold">{formatCurrencyAmount(row.amount, row.currency)}</td>
	<td><StatusBadge label={statusLabel(row.status)} tone={statusTone(row.status)} /></td>
</tr>
