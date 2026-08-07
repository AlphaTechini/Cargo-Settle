<script lang="ts">
	import type { ShipperFundingRequest } from '$lib/funding';
	import { fundingStatusLabel, fundingStatusTone } from '$lib/funding';
	import { formatCurrencyAmount } from '$lib/dashboard';
	import StatusBadge from './StatusBadge.svelte';

	let { request } = $props<{ request: ShipperFundingRequest }>();

	function formatDate(value: string) {
		return new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(value));
	}
</script>

<article class="cs-card p-5">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div>
			<p class="text-xs font-extrabold tracking-wider text-amber-700 uppercase">Funding request</p>
			<h2 class="mt-2 text-xl font-extrabold">{request.shipment.reference}</h2>
			<p class="cs-muted mt-1 text-sm">
				{request.shipment.origin} -> {request.shipment.destination}
			</p>
		</div>
		<StatusBadge
			label={fundingStatusLabel(request.status)}
			tone={fundingStatusTone(request.status)}
		/>
	</div>
	<div class="mt-5 grid gap-3 sm:grid-cols-3">
		<div class="rounded-xl bg-slate-50 p-4">
			<p class="cs-muted text-xs">Requested amount</p>
			<p class="mt-2 font-extrabold">{formatCurrencyAmount(request.amount, request.currency)}</p>
		</div>
		<div class="rounded-xl bg-slate-50 p-4">
			<p class="cs-muted text-xs">Requested by</p>
			<p class="mt-2 truncate font-extrabold">{request.requestedBy}</p>
		</div>
		<div class="rounded-xl bg-slate-50 p-4">
			<p class="cs-muted text-xs">Created</p>
			<p class="mt-2 font-extrabold">{formatDate(request.createdAt)}</p>
		</div>
	</div>
</article>
