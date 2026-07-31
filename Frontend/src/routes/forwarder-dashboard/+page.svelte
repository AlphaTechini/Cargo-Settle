<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let taskFilter = $state('All tasks');
	let attentionResolved = $state<string[]>([]);
	const tasks = [
		{
			id: 'fx',
			title: 'Review USDC -> EURC conversion for SHP-2048',
			detail: 'Rotterdam port agent · EURC 8,500 due tomorrow',
			tone: 'purple',
			label: 'FX required',
			icon: 'dollar'
		},
		{
			id: 'early',
			title: 'Approve early-payment request',
			detail: 'Metro Logistics · $9,700 available today',
			tone: 'warning',
			label: 'Due today',
			icon: 'clock'
		},
		{
			id: 'liquidity',
			title: 'Resolve insufficient Arc liquidity',
			detail: 'SHP-2071 · Carrier payment blocked',
			tone: 'danger',
			label: 'Blocked',
			icon: 'alert'
		}
	];

	function resolveTask(id: string) {
		attentionResolved = attentionResolved.includes(id)
			? attentionResolved.filter((item) => item !== id)
			: [...attentionResolved, id];
	}
</script>

<AppShell
	title="Operations overview"
	subtitle="Wednesday, July 29 · 4 items require attention"
	active="overview"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
			<MetricCard
				label="Active shipments"
				value="18"
				note="+3 since last week"
				icon="container"
			/><MetricCard
				label="Settlement volume"
				value="$428.6K"
				note="Across USDC and EURC"
				icon="dollar"
			/><MetricCard
				label="Ready to settle"
				value="8"
				note="$31,420 available now"
				icon="check-circle"
			/><MetricCard label="Exceptions" value="4" note="1 payment failure" icon="alert" />
		</div>
		<div class="cs-card mt-5 overflow-hidden">
			<div class="cs-divider flex items-center justify-between border-b px-5 py-4">
				<div>
					<h2 class="font-extrabold">Shipment settlement workflow</h2>
					<p class="cs-muted mt-1 text-xs">Work requiring action across active shipments</p>
				</div>
				<a href="/forwarder-shipments" class="text-sm font-bold text-teal-700">View shipments</a>
			</div>
			<div class="grid md:grid-cols-4">
				<div class="cs-divider border-t-4 border-t-amber-500 p-5 md:border-r">
					<p class="cs-muted text-xs font-extrabold tracking-wider uppercase">Funding</p>
					<p class="cs-kpi mt-4 text-3xl font-extrabold">3</p>
					<p class="mt-1 font-bold">Need funding</p>
					<p class="cs-muted mt-4 text-xs">1 insufficient liquidity</p>
				</div>
				<div class="cs-divider border-t-4 border-t-blue-500 p-5 md:border-r">
					<p class="cs-muted text-xs font-extrabold tracking-wider uppercase">In transit</p>
					<p class="cs-kpi mt-4 text-3xl font-extrabold">12</p>
					<p class="mt-1 font-bold">Active shipments</p>
					<p class="cs-muted mt-4 text-xs">4 milestones due today</p>
				</div>
				<div class="cs-divider border-t-4 border-t-purple-500 p-5 md:border-r">
					<p class="cs-muted text-xs font-extrabold tracking-wider uppercase">Review</p>
					<p class="cs-kpi mt-4 text-3xl font-extrabold">6</p>
					<p class="mt-1 font-bold">Evidence submitted</p>
					<p class="cs-muted mt-4 text-xs">2 unassigned</p>
				</div>
				<div class="border-t-4 border-t-emerald-500 p-5">
					<p class="cs-muted text-xs font-extrabold tracking-wider uppercase">Settlement</p>
					<p class="cs-kpi mt-4 text-3xl font-extrabold">8</p>
					<p class="mt-1 font-bold">Ready to settle</p>
					<p class="cs-muted mt-4 text-xs">3 require FX</p>
				</div>
			</div>
		</div>
		<div class="mt-5 grid gap-5 xl:grid-cols-[1fr_330px]">
			<div class="space-y-5">
				<div class="cs-card">
					<div class="cs-divider flex items-center justify-between border-b px-5 py-4">
						<div>
							<h2 class="font-extrabold">Requires your attention</h2>
							<p class="cs-muted mt-1 text-xs">Prioritized by settlement risk and due date</p>
						</div>
						<select class="cs-filter" bind:value={taskFilter}
							><option>All tasks</option><option>Open only</option><option>Resolved</option></select
						>
					</div>
					<div class="cs-divider divide-y">
						{#each tasks as task (task.id)}<div
								class={`flex items-center gap-4 p-4 transition ${attentionResolved.includes(task.id) ? 'opacity-50' : 'hover:bg-slate-50'}`}
							>
								<span class="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-teal-700"
									><Icon name={task.icon} /></span
								>
								<div class="min-w-0 flex-1">
									<p
										class={`text-sm font-bold ${attentionResolved.includes(task.id) ? 'line-through' : ''}`}
									>
										{task.title}
									</p>
									<p class="cs-muted mt-1 text-xs">{task.detail}</p>
								</div>
								<StatusBadge
									label={attentionResolved.includes(task.id) ? 'Resolved' : task.label}
									tone={attentionResolved.includes(task.id) ? 'success' : task.tone}
								/><button class="cs-btn cs-btn-secondary !px-3" onclick={() => resolveTask(task.id)}
									>{attentionResolved.includes(task.id) ? 'Reopen' : 'Resolve'}</button
								>
							</div>{/each}
					</div>
				</div>
				<div class="cs-card p-5">
					<div class="flex items-center justify-between">
						<div>
							<h2 class="font-extrabold">Today's shipment milestones</h2>
							<p class="cs-muted mt-1 text-xs">Operational events that may unlock payments</p>
						</div>
						<a href="/forwarder-shipments" class="text-sm font-bold text-teal-700">Open calendar</a>
					</div>
					<div class="mt-5 grid gap-3 md:grid-cols-3">
						<div class="cs-card-sm p-4">
							<p class="cs-muted text-xs">09:30 · Rotterdam</p>
							<p class="mt-2 font-bold">Customs clearance</p>
							<StatusBadge label="Evidence pending" tone="warning" />
						</div>
						<div class="cs-card-sm p-4">
							<p class="cs-muted text-xs">13:00 · Hamburg</p>
							<p class="mt-2 font-bold">Warehouse release</p>
							<StatusBadge label="On schedule" tone="info" />
						</div>
						<div class="cs-card-sm p-4">
							<p class="cs-muted text-xs">16:45 · Lagos</p>
							<p class="mt-2 font-bold">Final delivery</p>
							<StatusBadge label="Partner confirmed" tone="success" />
						</div>
					</div>
				</div>
			</div>
			<div class="space-y-5">
				<div class="cs-card p-5">
					<div class="flex justify-between">
						<div>
							<p class="cs-muted text-sm font-semibold">Outstanding obligations</p>
							<p class="cs-kpi mt-2 text-3xl font-extrabold">$186,400</p>
						</div>
						<Icon name="receipt" size={24} className="text-amber-700" />
					</div>
					<div class="cs-progress mt-4"><span style="width: 68%"></span></div>
					<p class="cs-muted mt-2 text-xs">$126,800 funded</p>
				</div>
				<div class="cs-card p-5">
					<h3 class="font-extrabold">Upcoming settlements</h3>
					<div class="mt-4 space-y-4">
						<div class="flex justify-between">
							<div>
								<p class="text-sm font-bold">Today</p>
								<p class="cs-muted text-xs">5 obligations</p>
							</div>
							<p class="font-extrabold">$28,750</p>
						</div>
						<div class="flex justify-between">
							<div>
								<p class="text-sm font-bold">Next 7 days</p>
								<p class="cs-muted text-xs">18 obligations</p>
							</div>
							<p class="font-extrabold">$94,300</p>
						</div>
					</div>
				</div>
				<div class="cs-card p-5">
					<h3 class="font-extrabold">Treasury readiness</h3>
					<div class="mt-4 flex items-center gap-3">
						<div
							class="grid h-12 w-12 place-items-center rounded-full border-[7px] border-emerald-500 border-r-slate-200"
						></div>
						<div>
							<p class="text-2xl font-extrabold">84%</p>
							<p class="cs-muted text-xs">Obligations covered</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</AppShell>
