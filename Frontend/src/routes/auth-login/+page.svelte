<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';

	let email = $state('amara@northstarfreight.com');
	let password = $state('');
	let keepSignedIn = $state(true);
	let error = $state('');
	let loading = $state(false);

	async function signIn() {
		error = '';
		loading = true;
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email, password, rememberMe: keepSignedIn })
			});
			const result = (await response.json()) as {
				error?: string;
				businessRole?: 'shipper' | 'freight_forwarder' | 'logistics_partner' | null;
			};
			if (!response.ok) {
				error = result.error ?? 'Unable to sign in';
				return;
			}
			await goto(
				result.businessRole === 'shipper'
					? '/shipper-dashboard'
					: result.businessRole === 'logistics_partner'
						? '/partner-dashboard'
						: '/forwarder-dashboard'
			);
		} catch {
			error = 'The authentication service is unavailable';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head><title>Sign in · CargoSettle</title></svelte:head>
<div class="grid min-h-screen lg:grid-cols-[.9fr_1.1fr]">
	<section class="flex flex-col p-6 lg:p-12">
		<Logo />
		<div class="mx-auto my-auto w-full max-w-md py-12">
			<p class="text-xs font-extrabold tracking-[.18em] text-teal-700 uppercase">Welcome back</p>
			<h1 class="mt-3 text-4xl font-extrabold tracking-tight">Sign in to CargoSettle</h1>
			<p class="cs-muted mt-3">
				Manage shipments, obligations, and settlement activity from one operational workspace.
			</p>
			<form
				class="mt-8 space-y-5"
				onsubmit={(event) => {
					event.preventDefault();
					signIn();
				}}
			>
				<div>
					<label class="cs-label" for="email">Work email</label><input
						id="email"
						class="cs-input"
						type="email"
						autocomplete="email"
						bind:value={email}
					/>
				</div>
				<div>
					<div class="flex justify-between">
						<label class="cs-label" for="password">Password</label><a
							class="text-xs font-bold text-teal-700"
							href="/auth-login">Forgot password?</a
						>
					</div>
					<input
						id="password"
						class="cs-input"
						type="password"
						autocomplete="current-password"
						bind:value={password}
					/>
				</div>
				<label class="cs-muted flex items-center gap-2 text-sm"
					><input type="checkbox" bind:checked={keepSignedIn} class="accent-teal-700" />Keep me
					signed in</label
				><button type="submit" class="cs-btn cs-btn-primary w-full !py-3" disabled={loading}
					>{loading ? 'Signing in...' : 'Sign in'} <Icon name="arrow-right" size={16} /></button
				>
			</form>
			{#if error}<div class="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-900">{error}</div>{/if}
			<p class="cs-muted mt-7 text-center text-sm">
				New to CargoSettle? <a class="font-bold text-teal-700" href="/auth-register"
					>Create an account</a
				>
			</p>
		</div>
		<p class="cs-muted text-xs">Demo interface for the Arc Programmable Money Hackathon.</p>
	</section>
	<section class="relative hidden overflow-hidden bg-[#102a36] p-12 text-white lg:flex">
		<div class="cs-grid-bg absolute inset-0 opacity-10"></div>
		<div class="relative m-auto max-w-xl">
			<span
				class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold"
				><span class="h-2 w-2 rounded-full bg-emerald-400"></span>Shipment SHP-2048 settled</span
			>
			<h2 class="mt-6 text-5xl leading-tight font-extrabold tracking-[-.04em]">
				Every shipment obligation, finally visible in one place.
			</h2>
			<div class="cs-card cs-shadow mt-10 !bg-white/95 p-5 !text-[#102a36]">
				<div class="flex justify-between">
					<div>
						<p class="cs-muted text-xs font-bold uppercase">Settlement summary</p>
						<p class="mt-1 text-xl font-extrabold">New York -> Rotterdam</p>
					</div>
					<span class="cs-status cs-status-success">Completed</span>
				</div>
				<div class="mt-5 grid grid-cols-3 gap-3">
					<div class="rounded-xl bg-slate-50 p-3">
						<p class="cs-muted text-xs">Funded</p>
						<p class="mt-1 font-extrabold">$24,800</p>
					</div>
					<div class="rounded-xl bg-slate-50 p-3">
						<p class="cs-muted text-xs">Partners</p>
						<p class="mt-1 font-extrabold">4</p>
					</div>
					<div class="rounded-xl bg-slate-50 p-3">
						<p class="cs-muted text-xs">Currencies</p>
						<p class="mt-1 font-extrabold">2</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
