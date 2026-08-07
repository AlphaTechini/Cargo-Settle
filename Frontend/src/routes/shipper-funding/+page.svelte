<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import FundingRequestCard from '$lib/components/FundingRequestCard.svelte';

	let { data }: { data: PageData } = $props();
</script>

<AppShell
	title="Funding request"
	subtitle="Review how your payment will be allocated"
	active="funding"
	role="shipper"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="mx-auto max-w-5xl space-y-5">
			<div>
				<h2 class="text-2xl font-extrabold">Funding requests</h2>
				<p class="cs-muted mt-2 text-sm">Requests recorded for your shipments.</p>
			</div>
			{#if data.funding.requests.length === 0}
				<div class="cs-card p-6">
					<p class="cs-muted text-sm">No funding requests have been recorded.</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each data.funding.requests as request (request.id)}
						<FundingRequestCard {request} />
					{/each}
				</div>
			{/if}
		</div>
	</section>
</AppShell>
