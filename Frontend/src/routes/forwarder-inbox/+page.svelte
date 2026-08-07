<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import RequiresAttention from '$lib/components/RequiresAttention.svelte';
	import OperationalObligationCard from '$lib/components/OperationalObligationCard.svelte';

	let { data }: { data: PageData } = $props();
</script>

<AppShell
	title="Operations inbox"
	subtitle="Review failed, blocked, and overdue operational records"
	active="inbox"
>
	<section class="mx-auto max-w-[1200px] p-5 lg:p-8">
		<div class="grid gap-5 lg:grid-cols-[1fr_360px]">
			<div class="cs-card p-5">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="font-extrabold">Open operational records</h2>
						<p class="cs-muted mt-1 text-xs">
							Derived from persisted funding, settlement, milestone, and obligation records
						</p>
					</div>
				</div>
				<div class="mt-5">
					<RequiresAttention items={data.dashboard.attention} />
				</div>
			</div>
			<aside class="cs-card h-fit p-5">
				<h3 class="font-extrabold">Overdue obligations</h3>
				<div class="cs-divider mt-4 divide-y">
					{#if data.dashboard.upcomingObligations.filter((item) => item.dueAt && new Date(item.dueAt) < new Date()).length === 0}
						<p class="cs-muted py-4 text-sm">No overdue obligations in the loaded records.</p>
					{:else}
						{#each data.dashboard.upcomingObligations.filter((item) => item.dueAt && new Date(item.dueAt) < new Date()) as obligation (obligation.id)}
							<OperationalObligationCard {obligation} />
						{/each}
					{/if}
				</div>
			</aside>
		</div>
	</section>
</AppShell>
