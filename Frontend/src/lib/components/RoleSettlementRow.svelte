<script lang="ts">
	import { formatCurrencyAmount } from '$lib/dashboard';
	import type { RoleSettlementRow as SettlementRow } from '$lib/operations';
	import StatusBadge from './StatusBadge.svelte';

	let { row }: { row: SettlementRow } = $props();

	function formatDate(value: string | null) {
		if (!value) return '';
		return new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(value));
	}

	function statusLabel(status: SettlementRow['status']) {
		return status.replace('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase());
	}

	function statusTone(status: SettlementRow['status']) {
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
	<td>{row.recipient}</td>
	<td class="font-extrabold">{formatCurrencyAmount(row.amount, row.currency)}</td>
	<td><StatusBadge label={statusLabel(row.status)} tone={statusTone(row.status)} /></td>
</tr>
