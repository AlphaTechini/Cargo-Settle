<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';

	const roles = [
		{
			id: 'forwarder',
			label: 'Freight forwarder',
			description: 'Coordinate shipments, partners, obligations, treasury, and settlement.',
			icon: 'route',
			tone: 'teal'
		},
		{
			id: 'shipper',
			label: 'Shipper',
			description: 'Fund shipments and track how your payment is allocated and settled.',
			icon: 'container',
			tone: 'blue'
		},
		{
			id: 'partner',
			label: 'Logistics partner',
			description: 'Manage assigned work, submit evidence, and receive settlement.',
			icon: 'truck',
			tone: 'amber'
		}
	] as const;

	let selectedRole = $state('forwarder');
	let fullName = $state('');
	let email = $state('');
	let password = $state('');
	let company = $state('');
	let region = $state('Global');
	let error = $state('');
	let loading = $state(false);
	const roleToneClasses: Record<string, string> = {
		teal: 'bg-teal-50 text-teal-700',
		blue: 'bg-blue-50 text-blue-700',
		amber: 'bg-amber-50 text-amber-700'
	};

	const roleValues = {
		forwarder: 'freight_forwarder',
		shipper: 'shipper',
		partner: 'logistics_partner'
	} as const;

	async function createWorkspace() {
		error = '';
		loading = true;
		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					displayName: fullName,
					email,
					password,
					workspaceName: company,
					businessRole: roleValues[selectedRole as keyof typeof roleValues]
				})
			});
			const result = (await response.json()) as {
				error?: string;
				businessRole?: 'shipper' | 'freight_forwarder' | 'logistics_partner';
				workspace?: { id: string } | null;
			};
			if (!response.ok) {
				error = result.error ?? 'Unable to create your workspace';
				return;
			}
			if (!result.workspace) {
				await goto(`/account-pending?role=${selectedRole}`);
				return;
			}
			await goto(
				result.businessRole === 'freight_forwarder'
					? '/forwarder-dashboard'
					: result.businessRole === 'logistics_partner'
						? '/partner-dashboard'
						: '/shipper-dashboard'
			);
		} catch {
			error = 'The authentication service is unavailable';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head><title>Create account · CargoSettle</title></svelte:head>
<header class="cs-divider border-b bg-white">
	<div class="mx-auto flex max-w-6xl items-center justify-between p-5">
		<Logo /><a href="/auth-login" class="cs-btn cs-btn-secondary">Sign in</a>
	</div>
</header>
<main class="mx-auto max-w-5xl px-5 py-12 lg:px-8">
	<div class="max-w-2xl">
		<p class="text-xs font-extrabold tracking-[.18em] text-teal-700 uppercase">
			Create your workspace
		</p>
		<h1 class="mt-3 text-4xl font-extrabold tracking-tight">
			How will your company use CargoSettle?
		</h1>
		<p class="cs-muted mt-3">
			Choose the role that best matches your place in a shipment. You can invite additional team
			members after setup.
		</p>
	</div>
	<div class="mt-9 grid gap-5 md:grid-cols-3">
		{#each roles as role (role.id)}<button
				type="button"
				class={`cs-card cursor-pointer p-5 text-left transition ${selectedRole === role.id ? 'border-2 border-teal-600 bg-teal-50/30' : 'hover:cs-shadow'}`}
				onclick={() => (selectedRole = role.id)}
				aria-pressed={selectedRole === role.id}
				><span
					class={`mt-5 grid h-11 w-11 place-items-center rounded-xl ${roleToneClasses[role.tone]}`}
					><Icon name={role.icon} /></span
				>
				<h2 class="mt-4 text-lg font-extrabold">{role.label}</h2>
				<p class="cs-muted mt-2 text-sm leading-6">{role.description}</p></button
			>{/each}
	</div>
	<form
		class="cs-card mt-6 grid gap-5 p-6 md:grid-cols-2"
		onsubmit={(event) => {
			event.preventDefault();
			createWorkspace();
		}}
	>
		<div>
			<label class="cs-label" for="name">Full name</label><input
				id="name"
				class="cs-input"
				bind:value={fullName}
				placeholder="Amara Dike"
			/>
		</div>
		<div>
			<label class="cs-label" for="work-email">Work email</label><input
				id="work-email"
				class="cs-input"
				type="email"
				autocomplete="email"
				bind:value={email}
				placeholder="amara@company.com"
			/>
		</div>
		<div>
			<label class="cs-label" for="password">Password</label><input
				id="password"
				class="cs-input"
				type="password"
				autocomplete="new-password"
				bind:value={password}
				placeholder="At least 8 characters"
			/>
		</div>
		<div>
			<label class="cs-label" for="company">Company name</label><input
				id="company"
				class="cs-input"
				bind:value={company}
				placeholder="Northstar Freight"
			/>
		</div>
		<div>
			<label class="cs-label" for="region">Primary operating region</label><select
				id="region"
				class="cs-input"
				bind:value={region}
				><option>Global</option><option>Europe</option><option>North America</option><option
					>Africa</option
				><option>Asia Pacific</option></select
			>
		</div>
		<div class="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
			<p class="cs-muted text-sm">
				Selected role: <span class="font-bold text-teal-700"
					>{roles.find((role) => role.id === selectedRole)?.label}</span
				>
			</p>
			<button type="submit" class="cs-btn cs-btn-primary" disabled={loading}
				>{loading ? 'Creating...' : 'Create workspace'}
				<Icon name="arrow-right" size={16} /></button
			>
		</div>
		{#if error}<div class="rounded-xl bg-red-50 p-4 text-sm text-red-900 md:col-span-2">
				{error}
			</div>{/if}
	</form>
</main>
