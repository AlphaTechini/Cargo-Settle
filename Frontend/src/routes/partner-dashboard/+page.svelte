<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
</script>

<AppShell
	title="Partner overview"
	subtitle="Your work, receivables, and settlement activity"
	active="overview"
	role="partner"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="grid gap-4 md:grid-cols-4">
			<MetricCard
				label="Assigned shipments"
				value="6"
				note="2 require action"
				icon="container"
			/><MetricCard
				label="Earned value"
				value="$38,900"
				note="Across active obligations"
				icon="dollar"
			/><MetricCard
				label="Available early"
				value="$9,700"
				note="1 approved obligation"
				icon="clock"
			/><MetricCard
				label="Received this month"
				value="$26,400"
				note="4 settlements"
				icon="check-circle"
			/>
		</div>
		<div class="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
			<div class="space-y-5">
				<div class="cs-card p-5">
					<div class="flex justify-between">
						<div>
							<h2 class="font-extrabold">Assigned work</h2>
							<p class="cs-muted mt-1 text-xs">Milestones and documents requiring action</p>
						</div>
						<a href="/partner-shipments" class="text-sm font-bold text-teal-700">View all</a>
					</div>
					<div class="cs-divider mt-4 divide-y">
						<div class="flex items-center gap-4 py-4">
							<span class="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"
								><Icon name="truck" /></span
							>
							<div>
								<p class="font-bold">Final delivery · SHP-2048</p>
								<p class="cs-muted mt-1 text-xs">Newark terminal -> Rotterdam warehouse</p>
							</div>
							<div class="ml-auto text-right">
								<p class="font-extrabold">$10,000</p>
								<StatusBadge label="Evidence required" tone="warning" />
							</div>
						</div>
						<div class="flex items-center gap-4 py-4">
							<span
								class="grid h-11 w-11 place-items-center rounded-xl bg-purple-50 text-purple-700"
								><Icon name="upload" /></span
							>
							<div>
								<p class="font-bold">Upload invoice · SHP-2076</p>
								<p class="cs-muted mt-1 text-xs">Container transport · Due Aug 3</p>
							</div>
							<div class="ml-auto text-right">
								<p class="font-extrabold">$4,600</p>
								<StatusBadge label="Action required" tone="danger" />
							</div>
						</div>
					</div>
				</div>
				<div class="cs-card p-5">
					<h2 class="font-extrabold">Payment schedule</h2>
					<div class="mt-5 grid gap-3 md:grid-cols-3">
						<div class="cs-card-sm p-4">
							<p class="cs-muted text-xs">Today</p>
							<p class="mt-2 text-xl font-extrabold">$9,700</p>
							<p class="cs-muted mt-2 text-xs">Early payment available</p>
						</div>
						<div class="cs-card-sm p-4">
							<p class="cs-muted text-xs">Next 7 days</p>
							<p class="mt-2 text-xl font-extrabold">$12,400</p>
							<p class="cs-muted mt-2 text-xs">2 obligations</p>
						</div>
						<div class="cs-card-sm p-4">
							<p class="cs-muted text-xs">Later</p>
							<p class="mt-2 text-xl font-extrabold">$16,800</p>
							<p class="cs-muted mt-2 text-xs">3 obligations</p>
						</div>
					</div>
				</div>
			</div>
			<aside class="space-y-5">
				<div class="cs-card p-5">
					<div class="flex justify-between">
						<div>
							<p class="text-xs font-bold tracking-wider text-purple-700 uppercase">
								Early payment
							</p>
							<h3 class="mt-2 text-xl font-extrabold">$9,700 available today</h3>
						</div>
						<Icon name="zap" className="text-purple-700" />
					</div>
					<p class="cs-muted mt-3 text-sm">
						Receive your $10,000 SHP-2048 obligation before Aug 29 for a $300 fee.
					</p>
					<a href="/partner-early-payment" class="cs-btn cs-btn-primary mt-5 w-full">Review offer</a
					>
				</div>
				<div class="cs-card p-5">
					<h3 class="font-extrabold">Latest settlement</h3>
					<div class="mt-4">
						<p class="text-2xl font-extrabold">$6,800 USDC</p>
						<p class="cs-muted mt-1 text-xs">SHP-2062 · Jul 29</p>
						<div class="mt-2"><StatusBadge label="Confirmed" tone="success" /></div>
					</div>
				</div>
			</aside>
		</div>
	</section>
</AppShell>
