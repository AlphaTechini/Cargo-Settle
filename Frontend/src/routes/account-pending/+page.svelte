<script lang="ts">
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';

	let { data }: { data: PageData } = $props();
</script>

<AppShell
	title="Account ready"
	subtitle="Your account is ready for workspace access"
	active="overview"
	role={data.role}
>
	<section class="mx-auto max-w-3xl p-5 lg:p-8">
		<div class="cs-card p-6 lg:p-8">
			<p class="text-xs font-extrabold tracking-wider text-teal-700 uppercase">Workspace access</p>
			<h2 class="mt-3 text-3xl font-extrabold">Your account is ready</h2>
			<p class="cs-muted mt-4 text-sm leading-6">
				You do not belong to a workspace yet. When a freight forwarder invites this email, the
				invitation will appear in the notification bell. Accept it there to enter the workspace and
				see its shipment data.
			</p>
			<div class="mt-6 rounded-xl bg-slate-50 p-4 text-sm">
				<b>What happens next</b>
				<p class="cs-muted mt-2">
					Keep this account signed in or return later. Workspace invitations remain separate, so
					accepting one does not mix data from another workspace.
				</p>
			</div>
		</div>
	</section>
</AppShell>
