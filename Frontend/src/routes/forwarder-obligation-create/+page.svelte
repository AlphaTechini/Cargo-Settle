<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
</script>

<AppShell
	title="Create obligation"
	subtitle="Payment obligation creation is outside the current read-only pass"
	active="partners"
>
	<section class="mx-auto max-w-3xl p-5 lg:p-8">
		<div class="cs-card p-6">
			<h2 class="text-2xl font-extrabold">Obligation creation is paused</h2>
			<p class="cs-muted mt-3 text-sm leading-6">
				Existing payment obligations are displayed from the database in the dashboard, treasury, and
				partner views. Creating or approving a new obligation will be wired with its persisted
				workflow separately.
			</p>
			<a href="/forwarder-partners" class="cs-btn cs-btn-secondary mt-5"
				>Review existing obligations</a
			>
		</div>
	</section>
</AppShell>
