<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';

	const screens = [
		['Public', 'Public landing page', 'Bonsai-inspired marketing composition', '/landing', 'route'],
		['All roles', 'Sign in', 'Enterprise authentication', '/auth-login', 'arrow-right'],
		['All roles', 'Create account', 'Role-aware onboarding', '/auth-register', 'plus'],
		[
			'Freight forwarder',
			'Operations dashboard',
			'Jobber-inspired shipment workflow',
			'/forwarder-dashboard',
			'layout-dashboard'
		],
		[
			'Freight forwarder',
			'Shipment portfolio',
			'Dense operational table',
			'/forwarder-shipments',
			'container'
		],
		[
			'Freight forwarder',
			'Shipment detail',
			'Milestones, obligations, documents, audit',
			'/forwarder-shipment-detail',
			'ship'
		],
		[
			'Freight forwarder',
			'Create shipment',
			'Multi-step enterprise workflow',
			'/forwarder-create-shipment',
			'plus'
		],
		[
			'Freight forwarder',
			'Operations inbox',
			'Front-inspired triage workspace',
			'/forwarder-inbox',
			'inbox'
		],
		[
			'Freight forwarder',
			'Partner management',
			'Melio-inspired partner/payables hub',
			'/forwarder-partners',
			'building'
		],
		[
			'Freight forwarder',
			'Partner network',
			'Databricks-inspired discovery',
			'/forwarder-partner-directory',
			'search'
		],
		[
			'Freight forwarder',
			'Create obligation',
			'Melio bill-details pattern',
			'/forwarder-obligation-create',
			'receipt'
		],
		[
			'Freight forwarder',
			'Treasury & FX',
			'Quicken-inspired liquidity planning',
			'/forwarder-treasury',
			'landmark'
		],
		[
			'Freight forwarder',
			'Settlement ledger',
			'Midday-inspired financial table',
			'/forwarder-settlements',
			'receipt'
		],
		[
			'Logistics partner',
			'Partner dashboard',
			'Focused receivables overview',
			'/partner-dashboard',
			'layout-dashboard'
		],
		[
			'Logistics partner',
			'Assigned shipments',
			'Work and milestone queue',
			'/partner-shipments',
			'container'
		],
		[
			'Logistics partner',
			'Early payment',
			'Receivable financing offer',
			'/partner-early-payment',
			'clock'
		],
		['Logistics partner', 'Payment history', 'Settlement ledger', '/partner-payments', 'receipt'],
		[
			'Shipper',
			'Shipper dashboard',
			'Simplified client-facing overview',
			'/shipper-dashboard',
			'layout-dashboard'
		],
		[
			'Shipper',
			'Shipper shipments',
			'Tracking and cost visibility',
			'/shipper-shipments',
			'container'
		],
		['Shipper', 'Funding requests', 'Review and fund shipments', '/shipper-funding', 'wallet'],
		['Shipper', 'Settlement history', 'Allocation and receipts', '/shipper-settlements', 'receipt']
	] as const;
</script>

<svelte:head>
	<title>Screen library · CargoSettle</title>
	<meta name="description" content="The CargoSettle SvelteKit screen library." />
</svelte:head>

<header class="cs-divider border-b bg-white">
	<div class="mx-auto flex max-w-[1450px] items-center justify-between px-5 py-5 lg:px-8">
		<Logo /><span class="cs-muted hidden text-sm sm:block">SvelteKit screen library</span>
	</div>
</header>

<main class="mx-auto max-w-[1450px] px-5 py-12 lg:px-8">
	<div class="max-w-3xl">
		<span class="text-xs font-extrabold tracking-[.18em] text-teal-700 uppercase"
			>CargoSettle UI system</span
		>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
			Shipment-native financial operations, designed as a real product.
		</h1>
		<p class="cs-muted mt-5 text-lg leading-8">
			Twenty-one responsive screens covering the freight forwarder, shipper, and logistics partner
			experiences. Each page is a separate SvelteKit route with local interactive demo state.
		</p>
	</div>
	<div class="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
		{#each screens as screen (screen[3])}
			<a
				href={screen[3]}
				class="cs-card hover:cs-shadow block p-5 transition hover:-translate-y-0.5"
				><div class="flex items-start justify-between gap-4">
					<span
						class="rounded-full bg-teal-50 px-2.5 py-1 text-[.68rem] font-bold tracking-wider text-teal-700 uppercase"
						>{screen[0]}</span
					><Icon name={screen[4]} size={16} className="cs-muted" />
				</div>
				<h2 class="mt-5 text-lg font-extrabold">{screen[1]}</h2>
				<p class="cs-muted mt-2 text-sm leading-6">{screen[2]}</p></a
			>
		{/each}
	</div>
</main>
