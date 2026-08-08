<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let { data }: { data: PageData } = $props();
	let tab = $state('Workspace');
	let workspaceName = $derived(data.settings.workspace.name);
	let saved = $state(false);
	let inviteOpen = $state(false);
	let inviteEmail = $state('');
	let inviteBusinessRole = $state<'shipper' | 'logistics_partner'>('shipper');
	let inviteAccessRole = $state<'admin' | 'operator' | 'finance' | 'member'>('member');
	let inviteMessage = $state('');
	let inviteToken = $state('');
	let inviteError = $state('');
	let loading = $state(false);

	function initials(name: string) {
		return name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('');
	}

	async function saveSettings() {
		saved = false;
		const response = await fetch(`/api/workspaces/${data.settings.workspace.id}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ name: workspaceName })
		});
		if (!response.ok) return;
		saved = true;
		await invalidateAll();
	}

	async function inviteMember() {
		inviteError = '';
		inviteMessage = '';
		inviteToken = '';
		loading = true;
		try {
			const response = await fetch(`/api/workspaces/${data.settings.workspace.id}/invitations`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					email: inviteEmail,
					businessRole: inviteBusinessRole,
					accessRole: inviteAccessRole
				})
			});
			const result = (await response.json()) as { error?: string; invitationToken?: string };
			if (!response.ok) {
				inviteError = result.error ?? 'Unable to create invitation';
				return;
			}
			inviteMessage = `Invitation created for ${inviteEmail}. Registration with that email will join this workspace automatically.`;
			inviteToken = result.invitationToken ?? '';
			inviteEmail = '';
			await invalidateAll();
		} catch {
			inviteError = 'The workspace invitation service is unavailable';
		} finally {
			loading = false;
		}
	}
</script>

<AppShell title="Settings" subtitle="Manage the active workspace and its members" active="settings">
	<section class="mx-auto max-w-[1200px] p-5 lg:p-8">
		<div class="cs-divider mb-5 flex gap-5 overflow-x-auto border-b">
			{#each ['Workspace', 'Team access'] as item (item)}
				<button
					class={`border-b-2 pb-3 text-sm font-bold whitespace-nowrap ${tab === item ? 'border-teal-700 text-teal-700' : 'cs-muted border-transparent'}`}
					onclick={() => (tab = item)}>{item}</button
				>
			{/each}
		</div>

		{#if tab === 'Workspace'}
			<div class="grid gap-5 lg:grid-cols-[1fr_320px]">
				<form
					class="cs-card p-6"
					onsubmit={(event) => {
						event.preventDefault();
						void saveSettings();
					}}
				>
					<h2 class="text-xl font-extrabold">Workspace profile</h2>
					<p class="cs-muted mt-1 text-sm">
						This information is shared by every member of the active workspace.
					</p>
					<div class="mt-7">
						<label class="cs-label" for="workspace">Workspace name</label>
						<input id="workspace" class="cs-input" bind:value={workspaceName} />
					</div>
					<div class="cs-divider mt-8 flex justify-end border-t pt-5">
						<button class="cs-btn cs-btn-primary" type="submit"
							><Icon name="check" size={16} />Save changes</button
						>
					</div>
				</form>
				<aside class="cs-card h-fit p-5">
					<p class="text-xs font-bold tracking-wider text-teal-700 uppercase">Workspace status</p>
					<p class="mt-2 text-2xl font-extrabold">Active</p>
					<p class="cs-muted mt-2 text-sm">
						Business role: {data.settings.membership.businessRole.replace('_', ' ')}
					</p>
					<p class="cs-muted mt-1 text-sm">Access role: {data.settings.membership.accessRole}</p>
					{#if saved}<div class="mt-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-900">
							Workspace changes saved.
						</div>{/if}
				</aside>
			</div>
		{:else}
			<div class="cs-card p-6">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 class="text-xl font-extrabold">Team access</h2>
						<p class="cs-muted mt-1 text-sm">Members are scoped to the active workspace.</p>
					</div>
					{#if data.settings.canManage}<button
							class="cs-btn cs-btn-primary"
							onclick={() => {
								inviteOpen = true;
								inviteError = '';
								inviteMessage = '';
							}}><Icon name="plus" size={16} />Invite member</button
						>{/if}
				</div>
				<div class="cs-divider mt-6 divide-y">
					{#each data.settings.members as member (member.userId)}
						<div class="flex flex-wrap items-center gap-3 py-4">
							<div
								class="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-sm font-bold"
							>
								{initials(member.displayName)}
							</div>
							<div class="flex-1">
								<p class="font-bold">{member.displayName}</p>
								<p class="cs-muted text-xs">{member.email}</p>
							</div>
							<StatusBadge
								label={`${member.businessRole.replace('_', ' ')} · ${member.accessRole}`}
								tone={member.accessRole === 'owner' ? 'success' : 'neutral'}
							/>
						</div>
					{/each}
				</div>
				{#if data.settings.canManage}
					<div class="mt-6">
						<h3 class="font-extrabold">Pending invitations</h3>
						{#if data.settings.invitations.length === 0}<p class="cs-muted mt-3 text-sm">
								No pending invitations.
							</p>{:else}<div class="cs-divider mt-3 divide-y">
								{#each data.settings.invitations as invitation (invitation.id)}<div
										class="flex flex-wrap items-center justify-between gap-3 py-3"
									>
										<div>
											<p class="font-bold">{invitation.email}</p>
											<p class="cs-muted text-xs">
												{invitation.businessRole.replace('_', ' ')} · expires {new Date(
													invitation.expiresAt
												).toLocaleDateString()}
											</p>
										</div>
										<StatusBadge label="Pending" tone="warning" />
									</div>{/each}
							</div>{/if}
					</div>
				{/if}
			</div>
		{/if}
	</section>
</AppShell>

<DemoModal
	open={inviteOpen}
	title="Invite workspace member"
	description="The invited email will automatically join every matching workspace when they register or sign in."
	confirmLabel={loading ? 'Creating...' : 'Create invitation'}
	onClose={() => (inviteOpen = false)}
	onConfirm={() => void inviteMember()}
>
	<div class="space-y-4">
		<div>
			<label class="cs-label" for="invite-email">Email address</label><input
				id="invite-email"
				class="cs-input"
				type="email"
				bind:value={inviteEmail}
				placeholder="member@company.com"
			/>
		</div>
		<div>
			<label class="cs-label" for="invite-role">Business role</label><select
				id="invite-role"
				class="cs-input"
				bind:value={inviteBusinessRole}
				><option value="shipper">Shipper</option><option value="logistics_partner"
					>Logistics partner</option
				></select
			>
		</div>
		<div>
			<label class="cs-label" for="invite-access">Workspace access</label><select
				id="invite-access"
				class="cs-input"
				bind:value={inviteAccessRole}
				><option value="member">Member</option><option value="operator">Operator</option><option
					value="finance">Finance</option
				><option value="admin">Admin</option></select
			>
		</div>
		{#if inviteError}<p class="rounded-xl bg-red-50 p-3 text-sm text-red-900">{inviteError}</p>{/if}
		{#if inviteMessage}<div class="rounded-xl bg-teal-50 p-3 text-sm text-teal-900">
				<p>{inviteMessage}</p>
				{#if inviteToken}<p class="mt-2 font-mono text-xs break-all">
						Development token: {inviteToken}
					</p>{/if}
			</div>{/if}
	</div>
</DemoModal>
