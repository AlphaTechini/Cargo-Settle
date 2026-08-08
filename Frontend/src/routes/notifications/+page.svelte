<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';

	let { data }: { data: PageData } = $props();
	let hiddenNotificationIds = $state<string[]>([]);
	let notifications = $derived(
		data.notifications.filter((notification) => !hiddenNotificationIds.includes(notification.id))
	);
	let acceptingId = $state<string | null>(null);
	let error = $state('');

	async function acceptNotification(notification: PageData['notifications'][number]) {
		acceptingId = notification.id;
		error = '';
		try {
			const response = await fetch(`/api/notifications/${notification.id}/accept`, {
				method: 'POST'
			});
			if (!response.ok) {
				const result = (await response.json()) as { error?: string };
				error = result.error ?? 'Unable to accept this invitation';
				return;
			}
			hiddenNotificationIds = [...hiddenNotificationIds, notification.id];
			await invalidateAll();
			const businessRole = notification.invitation?.businessRole;
			if (businessRole === 'freight_forwarder') await goto('/forwarder-dashboard');
			if (businessRole === 'logistics_partner') await goto('/partner-dashboard');
			if (businessRole === 'shipper') await goto('/shipper-dashboard');
		} finally {
			acceptingId = null;
		}
	}
</script>

<AppShell
	title="Notifications"
	subtitle="Review workspace invitations and account activity"
	active=""
	role={data.role}
>
	<section class="mx-auto max-w-4xl p-5 lg:p-8">
		<div class="cs-card p-5 lg:p-7">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-xs font-extrabold tracking-[.18em] text-teal-700 uppercase">Inbox</p>
					<h2 class="mt-2 text-2xl font-extrabold tracking-tight">Your notifications</h2>
					<p class="cs-muted mt-2 text-sm">
						Workspace invitations and important CargoSettle activity appear here.
					</p>
				</div>
				<div class="rounded-xl bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800">
					{notifications.length} total
				</div>
			</div>

			{#if error}
				<div class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-900">{error}</div>
			{/if}

			{#if notifications.length === 0}
				<div class="cs-card-sm cs-muted mt-6 p-6 text-sm">No notifications yet.</div>
			{:else}
				<div class="mt-6 space-y-3">
					{#each notifications as notification (notification.id)}
						<article
							class={`rounded-2xl border p-4 ${notification.readAt ? 'border-slate-200 bg-slate-50' : 'border-teal-100 bg-teal-50'}`}
						>
							<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
								<div>
									<p class="font-extrabold">{notification.title}</p>
									<p class="cs-muted mt-1 text-sm">{notification.body}</p>
									{#if notification.invitation}
										<p class="mt-3 text-xs font-bold text-teal-800">
											Workspace: {notification.invitation.workspaceName}
										</p>
									{/if}
								</div>
								{#if notification.invitation?.status === 'pending'}
									<button
										class="cs-btn cs-btn-primary shrink-0 !py-2 text-xs"
										disabled={acceptingId === notification.id}
										onclick={() => void acceptNotification(notification)}
									>
										{acceptingId === notification.id ? 'Accepting...' : 'Accept invitation'}
									</button>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</AppShell>
