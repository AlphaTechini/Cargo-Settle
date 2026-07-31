<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
</script>

<AppShell
	title="Shipper overview"
	subtitle="Track funding, shipment progress, and payment allocation"
	active="overview"
	role="shipper"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="grid gap-4 md:grid-cols-4">
			<MetricCard
				label="Active shipments"
				value="8"
				note="5 currently in transit"
				icon="container"
			/><MetricCard
				label="Awaiting funding"
				value="2"
				note="$31,600 requested"
				icon="wallet"
			/><MetricCard
				label="Funded this month"
				value="$184.5K"
				note="Across 11 shipments"
				icon="dollar"
			/><MetricCard label="Settled" value="$126.8K" note="68.7% allocated" icon="check-circle" />
		</div>
		<div class="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
			<div class="space-y-5">
				<div class="cs-card p-5">
					<div class="flex justify-between">
						<div>
							<h2 class="font-extrabold">Shipment portfolio</h2>
							<p class="cs-muted mt-1 text-xs">Current shipment value by status</p>
						</div>
						<button class="cs-filter">Last 90 days</button>
					</div>
					<svg viewBox="0 0 720 220" class="mt-5 h-[240px] w-full"
						><line x1="30" y1="190" x2="690" y2="190" stroke="#dfe6ea" /><path
							d="M30 170 C90 160,120 130,180 138 S270 180,330 110 S430 90,500 95 S590 40,690 58"
							fill="none"
							stroke="#0c7c73"
							stroke-width="4"
						/><path
							d="M30 170 C90 160,120 130,180 138 S270 180,330 110 S430 90,500 95 S590 40,690 58 L690 190 L30 190 Z"
							fill="rgba(12,124,115,.08)"
						/></svg
					>
				</div>
				<div class="cs-card p-5">
					<div class="flex justify-between">
						<div>
							<h2 class="font-extrabold">Active shipments</h2>
							<p class="cs-muted mt-1 text-xs">Latest commercial and settlement progress</p>
						</div>
						<a href="/shipper-shipments" class="text-sm font-bold text-teal-700">View all</a>
					</div>
					<div class="cs-divider mt-4 divide-y">
						<div class="flex items-center gap-4 py-4">
							<span class="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"
								><Icon name="ship" /></span
							>
							<div>
								<p class="font-bold">SHP-2048 · New York -> Rotterdam</p>
								<p class="cs-muted mt-1 text-xs">Customs evidence under review</p>
							</div>
							<div class="ml-auto text-right">
								<p class="font-extrabold">$24,800</p>
								<StatusBadge label="In transit" tone="info" />
							</div>
						</div>
						<div class="flex items-center gap-4 py-4">
							<span class="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700"
								><Icon name="wallet" /></span
							>
							<div>
								<p class="font-bold">SHP-2089 · Miami -> Antwerp</p>
								<p class="cs-muted mt-1 text-xs">Funding requested by Northstar Freight</p>
							</div>
							<div class="ml-auto text-right">
								<p class="font-extrabold">$17,200</p>
								<StatusBadge label="Awaiting funding" tone="warning" />
							</div>
						</div>
					</div>
				</div>
			</div>
			<aside class="space-y-5">
				<div class="cs-card p-5">
					<h3 class="font-extrabold">Requires attention</h3>
					<div class="mt-4 space-y-4">
						<div>
							<p class="text-sm font-bold">Fund SHP-2089</p>
							<p class="cs-muted mt-1 text-xs">$17,200 requested · Due tomorrow</p>
							<a href="/shipper-funding" class="mt-2 inline-block text-sm font-bold text-teal-700"
								>Review request</a
							>
						</div>
						<div class="cs-divider border-t pt-4">
							<p class="text-sm font-bold">Approve settlement summary</p>
							<p class="cs-muted mt-1 text-xs">SHP-2038 · 4 partners paid</p>
						</div>
					</div>
				</div>
				<div class="cs-card p-5">
					<h3 class="font-extrabold">Recent settlement</h3>
					<p class="mt-4 text-2xl font-extrabold">$38,600</p>
					<p class="cs-muted mt-1 text-xs">SHP-2038 · Lagos -> Durban</p>
					<div class="mt-4 grid grid-cols-2 gap-2 text-xs">
						<div class="rounded-lg bg-slate-50 p-3">
							<span class="cs-muted">Partners</span><b class="mt-1 block">4</b>
						</div>
						<div class="rounded-lg bg-slate-50 p-3">
							<span class="cs-muted">Currencies</span><b class="mt-1 block">USDC</b>
						</div>
					</div>
				</div>
			</aside>
		</div>
	</section>
</AppShell>
