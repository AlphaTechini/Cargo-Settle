<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';

	let showDemo = $state(false);
</script>

<svelte:head
	><title>Cross-border freight settlement · CargoSettle</title><meta
		name="description"
		content="Programmable freight settlement on Arc."
	/></svelte:head
>

<header
	class="cs-divider mx-auto flex max-w-[1440px] items-center justify-between border-b px-5 py-5 lg:px-10"
>
	<Logo />
	<nav class="cs-muted hidden items-center gap-8 text-sm font-semibold md:flex">
		<a href="#product">Product</a><a href="#how">How it works</a><a href="#roles">For teams</a><a
			href="#arc">Built on Arc</a
		>
	</nav>
	<div class="flex gap-2">
		<a href="/auth-login" class="cs-btn cs-btn-secondary">Sign in</a><a
			href="/auth-register"
			class="cs-btn cs-btn-primary">Start project</a
		>
	</div>
</header>

<main>
	<section id="product" class="relative overflow-hidden">
		<div class="cs-grid-bg absolute inset-0 opacity-70"></div>
		<div
			class="relative mx-auto grid max-w-[1440px] items-center gap-14 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:py-28"
		>
			<div>
				<span
					class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800"
					><span class="h-2 w-2 rounded-full bg-emerald-500"></span>Programmable freight settlement
					on Arc</span
				>
				<h1 class="mt-6 text-5xl leading-[1.02] font-extrabold tracking-[-.05em] lg:text-7xl">
					Settle every freight partner from one shipment payment.
				</h1>
				<p class="cs-muted mt-7 max-w-2xl text-lg leading-8 lg:text-xl">
					CargoSettle turns shipment milestones into programmable obligations, handling multi-party
					payouts, currency conversion, and early supplier payments without weeks of reconciliation.
				</p>
				<div class="mt-8 flex flex-wrap gap-3">
					<button class="cs-btn cs-btn-primary !px-5 !py-3" onclick={() => (showDemo = !showDemo)}
						>Explore the demo <Icon name="arrow-right" size={16} /></button
					><a href="#how" class="cs-btn cs-btn-secondary !px-5 !py-3">See how it works</a>
				</div>
				{#if showDemo}<div class="cs-card cs-shadow mt-4 max-w-xl p-4 text-sm">
						<p class="font-bold">Demo ready</p>
						<p class="cs-muted mt-1">
							Choose a role from the screen library or start with the forwarder dashboard.
						</p>
						<a href="/forwarder-dashboard" class="mt-2 inline-block font-bold text-teal-700"
							>Open forwarder workspace</a
						>
					</div>{/if}
				<div class="cs-divider mt-10 grid max-w-xl grid-cols-3 gap-5 border-t pt-8">
					<div>
						<p class="text-2xl font-extrabold">1</p>
						<p class="cs-muted mt-1 text-xs">Customer payment</p>
					</div>
					<div>
						<p class="text-2xl font-extrabold">4+</p>
						<p class="cs-muted mt-1 text-xs">Partner obligations</p>
					</div>
					<div>
						<p class="text-2xl font-extrabold">2</p>
						<p class="cs-muted mt-1 text-xs">Settlement currencies</p>
					</div>
				</div>
			</div>
			<div class="relative min-h-[570px]">
				<div
					class="absolute inset-6 rotate-2 rounded-[36px] bg-gradient-to-br from-[#0d6d67] via-[#114753] to-[#102a36] lg:inset-10"
				></div>
				<div class="cs-card cs-shadow absolute inset-x-0 top-12 -rotate-1 p-5 lg:p-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="cs-muted text-xs font-bold tracking-wider uppercase">Shipment SHP-2048</p>
							<h3 class="mt-1 text-xl font-extrabold">New York -> Rotterdam</h3>
						</div>
						<span class="cs-status cs-status-info">In transit</span>
					</div>
					<div class="mt-6 flex items-center gap-3">
						<span class="h-3 w-3 rounded-full bg-teal-600"></span>
						<div class="cs-route-line flex-1"></div>
						<Icon name="ship" size={25} className="text-teal-700" />
						<div class="cs-route-line flex-1"></div>
						<span class="h-3 w-3 rounded-full border-2 border-slate-300"></span>
					</div>
					<div class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
						<div class="rounded-xl bg-slate-50 p-3">
							<p class="cs-muted text-[.65rem]">Funded</p>
							<p class="mt-1 font-extrabold">$24,800</p>
						</div>
						<div class="rounded-xl bg-slate-50 p-3">
							<p class="cs-muted text-[.65rem]">Settled</p>
							<p class="mt-1 font-extrabold">$11,200</p>
						</div>
						<div class="rounded-xl bg-slate-50 p-3">
							<p class="cs-muted text-[.65rem]">Partners</p>
							<p class="mt-1 font-extrabold">4</p>
						</div>
						<div class="rounded-xl bg-slate-50 p-3">
							<p class="cs-muted text-[.65rem]">FX</p>
							<p class="mt-1 font-extrabold">USDC/EURC</p>
						</div>
					</div>
					<div class="cs-divider mt-5 divide-y">
						<div class="flex items-center gap-3 py-3">
							<span class="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700"
								><Icon name="ship" size={16} /></span
							>
							<div>
								<p class="text-sm font-bold">Ocean carrier</p>
								<p class="cs-muted text-xs">Cargo loaded</p>
							</div>
							<div class="ml-auto text-right">
								<p class="font-extrabold">$8,000</p>
								<span class="cs-status cs-status-success">Paid</span>
							</div>
						</div>
						<div class="flex items-center gap-3 py-3">
							<span class="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700"
								><Icon name="building" size={16} /></span
							>
							<div>
								<p class="text-sm font-bold">Rotterdam port agent</p>
								<p class="cs-muted text-xs">Customs clearance</p>
							</div>
							<div class="ml-auto text-right">
								<p class="font-extrabold">EURC 2,500</p>
								<span class="cs-status cs-status-purple">FX required</span>
							</div>
						</div>
					</div>
				</div>
				<div class="cs-card-sm cs-shadow absolute bottom-16 left-0 w-[250px] p-4">
					<div class="flex items-center gap-3">
						<span
							class="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"
							><Icon name="check-circle" size={20} /></span
						>
						<div>
							<p class="text-sm font-extrabold">Carrier paid</p>
							<p class="cs-muted mt-1 text-xs">Milestone settlement confirmed</p>
						</div>
					</div>
				</div>
				<div class="cs-card-sm cs-shadow absolute right-0 bottom-4 w-[260px] p-4">
					<div class="flex items-center gap-3">
						<span class="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700"
							><Icon name="clock" size={20} /></span
						>
						<div>
							<p class="text-sm font-extrabold">Early payment ready</p>
							<p class="cs-muted mt-1 text-xs">$9,700 available today</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
	<section id="how" class="mx-auto max-w-[1440px] px-5 py-20 lg:px-10">
		<div class="max-w-2xl">
			<p class="text-xs font-extrabold tracking-[.18em] text-teal-700 uppercase">
				One shipment, one financial workflow
			</p>
			<h2 class="mt-4 text-4xl font-extrabold tracking-tight">
				Stop managing every partner payment as a separate emergency.
			</h2>
		</div>
		<div class="mt-10 grid gap-5 md:grid-cols-3">
			<div class="cs-card p-6">
				<span class="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700"
					><Icon name="route" /></span
				>
				<h3 class="mt-5 text-lg font-extrabold">Create obligations</h3>
				<p class="cs-muted mt-2 text-sm leading-6">
					Assign amounts, currencies, partners, due dates, and shipment milestones from one funded
					shipment.
				</p>
			</div>
			<div class="cs-card p-6">
				<span class="grid h-11 w-11 place-items-center rounded-xl bg-purple-50 text-purple-700"
					><Icon name="dollar" /></span
				>
				<h3 class="mt-5 text-lg font-extrabold">Convert and settle</h3>
				<p class="cs-muted mt-2 text-sm leading-6">
					Use USDC and EURC to settle cross-border obligations with transparent conversion and audit
					records.
				</p>
			</div>
			<div class="cs-card p-6">
				<span class="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-700"
					><Icon name="clock" /></span
				>
				<h3 class="mt-5 text-lg font-extrabold">Pay suppliers early</h3>
				<p class="cs-muted mt-2 text-sm leading-6">
					Let approved partners access earned value before the original contractual payment date.
				</p>
			</div>
		</div>
	</section>
	<section id="roles" class="bg-white px-5 py-20 lg:px-10">
		<div class="mx-auto max-w-5xl">
			<p class="text-xs font-extrabold tracking-[.18em] text-teal-700 uppercase">
				Built for the full shipment team
			</p>
			<div class="mt-6 grid gap-5 md:grid-cols-3">
				<a href="/forwarder-dashboard" class="cs-card p-6"
					><p class="font-extrabold">Freight forwarder</p>
					<p class="cs-muted mt-2 text-sm">
						Coordinate shipments, partners, obligations, treasury, and settlement.
					</p></a
				><a href="/shipper-dashboard" class="cs-card p-6"
					><p class="font-extrabold">Shipper</p>
					<p class="cs-muted mt-2 text-sm">
						Fund shipments and track how one payment is allocated.
					</p></a
				><a href="/partner-dashboard" class="cs-card p-6"
					><p class="font-extrabold">Logistics partner</p>
					<p class="cs-muted mt-2 text-sm">
						Manage assigned work, evidence, receivables, and early payment.
					</p></a
				>
			</div>
		</div>
	</section>
	<section id="arc" class="mx-auto max-w-[1440px] px-5 py-20 lg:px-10">
		<div class="cs-card overflow-hidden bg-[#102a36] p-8 text-[var(--cs-ink)] lg:p-12">
			<p class="text-xs font-extrabold tracking-[.18em] text-teal-300 uppercase">
				The financial layer
			</p>
			<h2 class="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight">
				Arc powers settlement while CargoSettle keeps the workflow visible.
			</h2>
			<p class="mt-4 max-w-2xl leading-7 text-slate-300">
				The interface turns commercial milestones into a shared operational record, ready for future
				database and wallet integration.
			</p>
		</div>
	</section>
</main>

<footer class="cs-divider border-t bg-[#102a36] px-5 py-10 text-white">
	<div
		class="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-5 md:flex-row lg:px-10"
	>
		<Logo />
		<p class="text-sm text-slate-300">Shipment-native programmable settlement on Arc.</p>
	</div>
</footer>
