<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let tab = $state('Workspace');
	let workspace = $state('Northstar Freight');
	let email = $state('amara@northstarfreight.com');
	let timezone = $state('UTC');
	let saved = $state(false);
	let inviteOpen = $state(false);
	let inviteEmail = $state('');
	let inviteMessage = $state('');

	function saveSettings() {
		saved = true;
	}
	function inviteMember() {
		inviteMessage = inviteEmail
			? `Invitation prepared for ${inviteEmail}.`
			: 'Enter an email address first.';
	}
</script>

<AppShell
	title="Settings"
	subtitle="Manage workspace preferences and team access"
	active="settings"
>
	<section class="mx-auto max-w-[1200px] p-5 lg:p-8">
		<div class="cs-divider mb-5 flex gap-5 overflow-x-auto border-b">
			{#each ['Workspace', 'Team access', 'Notifications'] as item (item)}<button
					class={`border-b-2 pb-3 text-sm font-bold whitespace-nowrap ${tab === item ? 'border-teal-700 text-teal-700' : 'cs-muted border-transparent'}`}
					onclick={() => (tab = item)}>{item}</button
				>{/each}
		</div>
		{#if tab === 'Workspace'}<div class="grid gap-5 lg:grid-cols-[1fr_320px]">
				<form
					class="cs-card p-6"
					onsubmit={(event) => {
						event.preventDefault();
						saveSettings();
					}}
				>
					<h2 class="text-xl font-extrabold">Workspace profile</h2>
					<p class="cs-muted mt-1 text-sm">
						Update the information your team sees across CargoSettle.
					</p>
					<div class="mt-7 grid gap-5 md:grid-cols-2">
						<div class="md:col-span-2">
							<label class="cs-label" for="workspace">Workspace name</label><input
								id="workspace"
								class="cs-input"
								bind:value={workspace}
							/>
						</div>
						<div>
							<label class="cs-label" for="email">Operations email</label><input
								id="email"
								class="cs-input"
								type="email"
								bind:value={email}
							/>
						</div>
						<div>
							<label class="cs-label" for="timezone">Timezone</label><select
								id="timezone"
								class="cs-input"
								bind:value={timezone}
								><option>UTC</option><option>Europe/Amsterdam</option><option
									>America/New_York</option
								><option>Africa/Lagos</option></select
							>
						</div>
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
					<p class="cs-muted mt-2 text-sm">Demo settings are stored in this page session only.</p>
					{#if saved}<div class="mt-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-900">
							Changes saved locally.
						</div>{/if}
				</aside>
			</div>{:else if tab === 'Team access'}<div class="cs-card p-6">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 class="text-xl font-extrabold">Team access</h2>
						<p class="cs-muted mt-1 text-sm">Invite people to the forwarder workspace.</p>
					</div>
					<button class="cs-btn cs-btn-primary" onclick={() => (inviteOpen = true)}
						><Icon name="plus" size={16} />Invite member</button
					>
				</div>
				<div class="cs-divider mt-6 divide-y">
					<div class="flex items-center gap-3 py-4">
						<div
							class="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-sm font-bold"
						>
							AD
						</div>
						<div class="flex-1">
							<p class="font-bold">Amara Dike</p>
							<p class="cs-muted text-xs">Owner · {email}</p>
						</div>
						<span class="cs-status cs-status-success">Active</span>
					</div>
					<div class="flex items-center gap-3 py-4">
						<div
							class="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-800"
						>
							JO
						</div>
						<div class="flex-1">
							<p class="font-bold">James Okafor</p>
							<p class="cs-muted text-xs">Operations manager · james@northstarfreight.com</p>
						</div>
						<button class="cs-filter" onclick={() => (inviteMessage = 'Member role menu opened.')}
							>Manager <Icon name="chevron-down" size={14} /></button
						>
					</div>
				</div>
			</div>{:else}<div class="cs-card p-6">
				<h2 class="text-xl font-extrabold">Notifications</h2>
				<p class="cs-muted mt-1 text-sm">
					Choose which operational events should appear in your workspace.
				</p>
				<div class="mt-6 space-y-4">
					<label class="flex items-center justify-between gap-4"
						><span
							><b>Settlement failures</b><small class="cs-muted block text-xs"
								>Critical payment and liquidity events</small
							></span
						><input type="checkbox" checked class="h-5 w-5 accent-teal-700" /></label
					><label class="flex items-center justify-between gap-4"
						><span
							><b>Milestone evidence</b><small class="cs-muted block text-xs"
								>New documents waiting for review</small
							></span
						><input type="checkbox" checked class="h-5 w-5 accent-teal-700" /></label
					><label class="flex items-center justify-between gap-4"
						><span
							><b>Weekly digest</b><small class="cs-muted block text-xs"
								>A summary of operations and treasury</small
							></span
						><input type="checkbox" class="h-5 w-5 accent-teal-700" /></label
					>
				</div>
			</div>{/if}{#if inviteMessage}<div
				class="mt-4 rounded-xl bg-teal-50 p-4 text-sm text-teal-900"
			>
				{inviteMessage}
			</div>{/if}
	</section>
</AppShell>

<DemoModal
	open={inviteOpen}
	title="Invite team member"
	description="Prepare a teammate invitation for this workspace."
	confirmLabel="Prepare invitation"
	onClose={() => (inviteOpen = false)}
	onConfirm={() => {
		inviteMember();
		if (inviteEmail) inviteOpen = false;
	}}
	><div>
		<label class="cs-label" for="invite-email">Work email</label><input
			id="invite-email"
			class="cs-input"
			type="email"
			bind:value={inviteEmail}
			placeholder="teammate@company.com"
		/><label class="mt-4 flex items-center gap-2 text-sm"
			><input type="checkbox" checked class="accent-teal-700" />Send operations manager access</label
		>
	</div></DemoModal
>
