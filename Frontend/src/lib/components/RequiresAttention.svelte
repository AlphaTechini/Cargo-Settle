<script lang="ts">
	import type { DashboardAttentionItem } from '$lib/dashboard';
	import type { OperationAttentionItem } from '$lib/operations';
	import Icon from './Icon.svelte';

	let { items } = $props<{ items: Array<DashboardAttentionItem | OperationAttentionItem> }>();
</script>

<div class="cs-card p-5">
	<h3 class="font-extrabold">Requires attention</h3>
	{#if items.length === 0}
		<p class="cs-muted mt-4 text-sm">No funding requests or shipment blockers require attention.</p>
	{:else}
		<div class="mt-4 space-y-4">
			{#each items as item (item.id)}
				<div class="flex gap-3">
					<span
						class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-teal-700"
					>
						<Icon name={item.icon} size={17} />
					</span>
					<div class="min-w-0">
						<p class="text-sm font-bold">{item.title}</p>
						<p class="cs-muted mt-1 text-xs">{item.detail}</p>
						<a
							href={item.href}
							class={`mt-2 inline-block text-sm font-bold ${item.tone === 'danger' ? 'text-red-700' : 'text-teal-700'}`}
						>
							Review
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
