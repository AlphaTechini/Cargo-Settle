<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import Logo from './Logo.svelte';
	import WalletButton from './WalletButton.svelte';

	type Role = 'forwarder' | 'partner' | 'shipper';

	let {
		title,
		subtitle,
		active,
		role = 'forwarder',
		children
	} = $props<{ title: string; subtitle: string; active: string; role?: Role; children: Snippet }>();

	let mobileMenuOpen = $state(false);
	let searchOpen = $state(false);
	let workspaceOpen = $state(false);
	let profileOpen = $state(false);

	const roleDetails = {
		forwarder: {
			label: 'Freight forwarder',
			workspaceLabel: 'Workspace',
			links: [
				['overview', 'Overview', 'layout-dashboard', '/forwarder-dashboard'],
				['shipments', 'Shipments', 'container', '/forwarder-shipments'],
				['inbox', 'Operations inbox', 'inbox', '/forwarder-inbox'],
				['partners', 'Partners', 'building', '/forwarder-partners'],
				['treasury', 'Treasury & FX', 'landmark', '/forwarder-treasury'],
				['settlements', 'Settlements', 'receipt', '/forwarder-settlements']
			] as const
		},
		partner: {
			label: 'Logistics partner',
			workspaceLabel: 'Partner portal',
			links: [
				['overview', 'Overview', 'layout-dashboard', '/partner-dashboard'],
				['shipments', 'Assigned shipments', 'container', '/partner-shipments'],
				['early-payment', 'Early payment', 'clock', '/partner-early-payment'],
				['payments', 'Payments', 'receipt', '/partner-payments']
			] as const
		},
		shipper: {
			label: 'Shipper',
			workspaceLabel: 'Shipper portal',
			links: [
				['overview', 'Overview', 'layout-dashboard', '/shipper-dashboard'],
				['shipments', 'Shipments', 'container', '/shipper-shipments'],
				['funding', 'Funding requests', 'wallet', '/shipper-funding'],
				['settlements', 'Settlements', 'receipt', '/shipper-settlements']
			] as const
		}
	} as const;

	let details = $derived(roleDetails[role as Role]);
	let currentUser = $derived(page.data.user);
	let activeWorkspace = $derived(page.data.activeWorkspace);
	let workspaceName = $derived(activeWorkspace?.name ?? 'No workspace selected');
	let profileName = $derived(currentUser?.displayName ?? 'Signed out');
	let profileInitials = $derived(currentUser ? getInitials(currentUser.displayName) : '??');

	function getInitials(name: string) {
		return name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('');
	}

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		await goto('/auth-login');
	}

	async function selectWorkspace(workspaceId: string) {
		const response = await fetch('/api/session/workspace', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ workspaceId })
		});
		if (response.ok) {
			workspaceOpen = false;
			await invalidateAll();
		}
	}
</script>

<svelte:head>
	<title>{title} · CargoSettle</title>
	<meta name="description" content={subtitle} />
</svelte:head>

<aside
	class="cs-desktop-sidebar cs-divider fixed inset-y-0 left-0 z-30 w-[244px] border-r bg-white"
>
	<div class="flex h-full flex-col px-4 py-5">
		<div class="mb-7 px-2"><Logo /></div>
		<div class="relative mb-5 px-2">
			<button
				class="cs-card-sm flex w-full items-center justify-between p-3 text-left"
				onclick={() => (workspaceOpen = !workspaceOpen)}
			>
				<span
					><span class="cs-muted block text-[.68rem] font-bold tracking-wider uppercase"
						>{details.workspaceLabel}</span
					><span class="mt-1 block text-sm font-bold">{workspaceName}</span></span
				>
				<Icon name="chevrons-up-down" size={16} className="cs-muted" />
			</button>
			{#if workspaceOpen}
				<div class="cs-card cs-shadow absolute top-full right-2 left-2 z-40 mt-2 p-2 text-sm">
					{#each page.data.workspaces ?? [] as workspace (workspace.id)}
						<button
							class={`w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50 ${workspace.id === activeWorkspace?.id ? 'bg-teal-50 font-bold text-teal-700' : ''}`}
							onclick={() => selectWorkspace(workspace.id)}>{workspace.name}</button
						>
					{/each}
					<a
						href="/settings"
						class="mt-1 block rounded-lg px-3 py-2 text-teal-700 hover:bg-slate-50"
						>Manage workspace</a
					>
				</div>
			{/if}
		</div>
		<nav class="space-y-1" aria-label="Primary navigation">
			{#each details.links as link (link[0])}
				<a href={link[3]} class:active={active === link[0]} class="cs-sidebar-link"
					><Icon name={link[2]} size={18} /><span>{link[1]}</span></a
				>
			{/each}
		</nav>
		{#if role === 'forwarder'}
			<div class="cs-divider mt-6 border-t pt-5">
				<a href="/forwarder-reports" class="cs-sidebar-link"
					><Icon name="bar-chart" size={18} /><span>Reports</span></a
				><a href="/settings" class="cs-sidebar-link"
					><Icon name="settings" size={18} /><span>Settings</span></a
				>
			</div>
		{/if}
		<div class="cs-card-sm relative mt-auto flex items-center gap-3 p-3">
			<div class="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-sm font-extrabold">
				{profileInitials}
			</div>
			<div class="min-w-0">
				<p class="truncate text-sm font-bold">{profileName}</p>
				<p class="cs-muted truncate text-xs">{details.label}</p>
			</div>
			<button
				class="cs-muted ml-auto rounded-md p-1"
				aria-label="Open profile menu"
				onclick={() => (profileOpen = !profileOpen)}><Icon name="more" size={18} /></button
			>
			{#if profileOpen}
				<div class="cs-card cs-shadow absolute right-0 bottom-full z-40 mb-2 w-56 p-3">
					{#if currentUser}<p class="cs-muted truncate text-xs">{currentUser.email}</p>{/if}
					<button class="cs-btn cs-btn-secondary mt-3 w-full" onclick={logout}>Sign out</button>
				</div>
			{/if}
		</div>
	</div>
</aside>

<main class="cs-main-shell ml-[244px] min-h-screen">
	<header class="cs-divider sticky top-0 z-20 border-b bg-[rgba(244,247,248,.92)] backdrop-blur">
		<div class="flex min-h-[76px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
			<div class="flex min-w-0 items-center gap-3">
				<button
					class="cs-divider rounded-lg border bg-white p-2 lg:hidden"
					aria-label="Open menu"
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					><Icon name={mobileMenuOpen ? 'x' : 'menu'} size={20} /></button
				>
				<div class="min-w-0">
					<div class="cs-muted mb-1 hidden items-center gap-2 text-xs sm:flex">
						<span>{workspaceName}</span><Icon name="chevron-right" size={13} /><span>{title}</span>
					</div>
					<h1 class="truncate text-[1.2rem] font-extrabold tracking-tight lg:text-[1.35rem]">
						{title}
					</h1>
					<p class="cs-muted mt-1 hidden text-sm sm:block">{subtitle}</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<WalletButton />
				<button
					class="cs-btn cs-btn-secondary !px-3"
					aria-label="Toggle search"
					onclick={() => (searchOpen = !searchOpen)}
					><Icon name="search" size={16} /><span class="hidden xl:inline">Search</span><kbd
						class="hidden rounded border bg-slate-100 px-1.5 py-0.5 text-[.65rem] xl:inline"
						>Ctrl K</kbd
					></button
				>
				{#if role === 'forwarder'}<a
						href="/forwarder-create-shipment"
						class="cs-btn cs-btn-primary hidden sm:inline-flex"
						><Icon name="plus" size={16} />New shipment</a
					>{/if}
			</div>
		</div>
		{#if searchOpen}<div class="cs-divider border-t px-5 py-3 lg:px-8">
				<input class="cs-input" placeholder={`Search ${title.toLowerCase()}`} />
			</div>{/if}
	</header>
	{#if mobileMenuOpen}<div class="cs-divider border-b bg-white p-4 lg:hidden">
			<div class="mb-4"><Logo /></div>
			<nav class="space-y-1">
				{#each details.links as link (link[0])}<a
						href={link[3]}
						class:active={active === link[0]}
						class="cs-sidebar-link"
						onclick={() => (mobileMenuOpen = false)}
						><Icon name={link[2]} size={18} /><span>{link[1]}</span></a
					>{/each}
			</nav>
		</div>{/if}
	{@render children()}
</main>
