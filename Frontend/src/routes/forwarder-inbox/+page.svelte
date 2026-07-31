<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let selected = $state('early');
	let listFilter = $state('Open');
	let modal = $state<'new' | 'details' | 'decline' | 'approve' | 'menu' | null>(null);
	let requestCreated = $state(false);
	let detailsRequested = $state(false);
	let declined = $state(false);
	let approved = $state(false);
	let askDraft = $state('');
	let newRequestTitle = $state('');
	let newRequestType = $state('Milestone review');
	const requestToneClasses: Record<string, string> = {
		purple: 'text-purple-700',
		danger: 'text-red-700',
		info: 'text-teal-700'
	};
	const requests = [
		{
			id: 'early',
			type: 'Early payment',
			title: 'Metro Logistics requests $9,700',
			detail: 'SHP-2048 · Final delivery obligation',
			tone: 'purple',
			status: 'Due today',
			statusTone: 'warning'
		},
		{
			id: 'exception',
			type: 'Settlement exception',
			title: 'Carrier payment blocked',
			detail: 'SHP-2071 · Insufficient Arc liquidity',
			tone: 'danger',
			status: 'Critical',
			statusTone: 'danger'
		},
		{
			id: 'review',
			type: 'Milestone review',
			title: 'Customs release submitted',
			detail: 'SHP-2048 · Rotterdam Port Services',
			tone: 'info',
			status: 'Unassigned',
			statusTone: 'neutral'
		}
	];

	function confirmModal() {
		if (modal === 'new') requestCreated = newRequestTitle.trim().length > 0;
		if (modal === 'details') detailsRequested = askDraft.trim().length > 0;
		if (modal === 'decline') declined = true;
		if (modal === 'approve') approved = true;
		if (modal !== 'details' || detailsRequested) modal = null;
	}
</script>

<AppShell
	title="Operations inbox"
	subtitle="Review milestones, early payments, and settlement exceptions"
	active="inbox"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="cs-card grid min-h-[650px] overflow-hidden lg:grid-cols-[190px_320px_1fr]">
			<aside class="cs-divider border-b bg-slate-50 p-4 lg:border-r lg:border-b-0">
				<button class="cs-btn cs-btn-primary w-full" onclick={() => (modal = 'new')}
					><Icon name="plus" size={16} />New request</button
				>
				<nav class="mt-5 space-y-1 text-sm">
					<button class="cs-sidebar-link active w-full" onclick={() => (listFilter = 'Open')}
						><Icon name="inbox" />Open <span class="ml-auto">8</span></button
					><button class="cs-sidebar-link w-full" onclick={() => (listFilter = 'Assigned')}
						><Icon name="check-circle" />Assigned to me <span class="ml-auto">3</span></button
					><button class="cs-sidebar-link w-full" onclick={() => (listFilter = 'Exceptions')}
						><Icon name="alert" />Exceptions <span class="ml-auto text-red-600">4</span></button
					><button class="cs-sidebar-link w-full" onclick={() => (listFilter = 'Completed')}
						><Icon name="check" />Completed</button
					>
				</nav>
				<p class="cs-muted mt-7 px-2 text-[.68rem] font-extrabold tracking-wider uppercase">
					Views
				</p>
				<nav class="mt-2 space-y-1 text-sm">
					<button class="cs-sidebar-link w-full text-left" onclick={() => (listFilter = 'Open')}
						>Milestone reviews</button
					><button
						class="cs-sidebar-link w-full text-left"
						onclick={() => (listFilter = 'Assigned')}>Early payments</button
					><button
						class="cs-sidebar-link w-full text-left"
						onclick={() => (listFilter = 'Exceptions')}>Settlement failures</button
					>
				</nav>
			</aside>
			<section class="cs-divider border-b lg:border-r lg:border-b-0">
				<div class="cs-divider border-b bg-white p-4">
					<div class="relative">
						<Icon
							name="search"
							size={16}
							className="absolute left-3 top-1/2 -translate-y-1/2 cs-muted"
						/><input class="cs-input !pl-9" placeholder="Search requests" />
					</div>
					<div class="mt-3 flex gap-2">
						<select class="cs-filter" bind:value={listFilter}
							><option>Open</option><option>Assigned</option><option>Exceptions</option><option
								>Completed</option
							></select
						><button class="cs-filter">Priority</button>
					</div>
				</div>
				<div class="cs-divider divide-y">
					{#each requests as request (request.id)}<button
							class={`w-full p-4 text-left ${selected === request.id ? 'border-l-4 border-l-teal-600 bg-teal-50/60' : 'hover:bg-slate-50'}`}
							onclick={() => (selected = request.id)}
							><div class="flex justify-between">
								<span class={`text-xs font-bold ${requestToneClasses[request.tone]}`}
									>{request.type}</span
								><span class="cs-muted text-xs"
									>{request.id === 'early' ? '38m' : request.id === 'exception' ? '1h' : '2h'}</span
								>
							</div>
							<h3 class="mt-2 font-extrabold">{request.title}</h3>
							<p class="cs-muted mt-2 text-xs">{request.detail}</p>
							<div class="mt-3">
								<StatusBadge label={request.status} tone={request.statusTone} />
							</div></button
						>{/each}
				</div>
			</section>
			<section class="flex min-w-0 flex-col">
				<div class="cs-divider flex items-start justify-between border-b p-5">
					<div>
						<div class="flex gap-2">
							<StatusBadge label="Early payment" tone="purple" /><StatusBadge
								label={approved ? 'Approved' : declined ? 'Declined' : 'Due today'}
								tone={approved ? 'success' : declined ? 'danger' : 'warning'}
							/>
						</div>
						<h2 class="mt-3 text-xl font-extrabold">Metro Logistics requests early payment</h2>
						<p class="cs-muted mt-1 text-sm">Shipment SHP-2048 · Obligation OBL-9914</p>
					</div>
					<button class="cs-btn cs-btn-secondary !px-3" onclick={() => (modal = 'menu')}
						><Icon name="more" /></button
					>
				</div>
				<div class="flex-1 overflow-y-auto p-6">
					<div class="grid gap-3 md:grid-cols-3">
						<div class="rounded-xl bg-slate-50 p-4">
							<p class="cs-muted text-xs">Earned amount</p>
							<p class="mt-2 text-xl font-extrabold">$10,000</p>
						</div>
						<div class="rounded-xl bg-slate-50 p-4">
							<p class="cs-muted text-xs">Available today</p>
							<p class="mt-2 text-xl font-extrabold">$9,700</p>
						</div>
						<div class="rounded-xl bg-slate-50 p-4">
							<p class="cs-muted text-xs">Financing fee</p>
							<p class="mt-2 text-xl font-extrabold">$300</p>
						</div>
					</div>
					<div class="cs-card-sm mt-5 p-5">
						<h3 class="font-extrabold">Request details</h3>
						<dl class="mt-4 grid gap-4 text-sm md:grid-cols-2">
							<div>
								<dt class="cs-muted">Partner</dt>
								<dd class="mt-1 font-bold">Metro Logistics</dd>
							</div>
							<div>
								<dt class="cs-muted">Original due date</dt>
								<dd class="mt-1 font-bold">Aug 29, 2026</dd>
							</div>
							<div>
								<dt class="cs-muted">Milestone</dt>
								<dd class="mt-1 font-bold">Final delivery</dd>
							</div>
							<div>
								<dt class="cs-muted">Evidence</dt>
								<dd class="mt-1 font-bold">Signed delivery receipt.pdf</dd>
							</div>
						</dl>
					</div>
					<div class="mt-6">
						<h3 class="font-extrabold">Internal discussion</h3>
						<div class="mt-4 flex gap-3">
							<div
								class="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xs font-bold"
							>
								AD
							</div>
							<div class="max-w-xl rounded-xl bg-slate-50 p-4">
								<p class="text-sm">
									Delivery evidence matches the shipment record. Treasury has sufficient USDC
									available.
								</p>
								<p class="cs-muted mt-2 text-xs">Amara · 8 minutes ago</p>
							</div>
						</div>
					</div>
				</div>
				<div
					class="cs-divider flex flex-wrap items-center justify-between gap-2 border-t bg-white p-4"
				>
					<button
						class="cs-btn cs-btn-danger"
						onclick={() => (modal = 'decline')}
						disabled={declined || approved}>Decline request</button
					>
					<div class="flex gap-2">
						<button
							class="cs-btn cs-btn-secondary"
							onclick={() => (modal = 'details')}
							disabled={declined || approved}>Ask for details</button
						><button
							class="cs-btn cs-btn-primary"
							onclick={() => (modal = 'approve')}
							disabled={approved || declined}>Approve $9,700</button
						>
					</div>
				</div>
			</section>
		</div>
		{#if requestCreated || detailsRequested || approved || declined}<div
				class="mt-4 grid gap-3 md:grid-cols-3"
			>
				{#if requestCreated}<div class="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
						<b>Request created</b>
						<p class="mt-1">{newRequestTitle}</p>
					</div>{/if}{#if detailsRequested}<div
						class="rounded-xl bg-amber-50 p-4 text-sm text-amber-900"
					>
						<b>Details requested</b>
						<p class="mt-1">The partner will receive your question.</p>
					</div>{/if}{#if approved}<div class="rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
						<b>Payment approved</b>
						<p class="mt-1">$9,700 is queued for local settlement.</p>
					</div>{/if}{#if declined}<div class="rounded-xl bg-red-50 p-4 text-sm text-red-900">
						<b>Request declined</b>
						<p class="mt-1">The request has been marked for follow-up.</p>
					</div>{/if}
			</div>{/if}
	</section>
</AppShell>

<DemoModal
	open={modal !== null}
	title={modal === 'new'
		? 'New operations request'
		: modal === 'details'
			? 'Ask for details'
			: modal === 'decline'
				? 'Decline early payment'
				: modal === 'approve'
					? 'Approve early payment'
					: 'Request actions'}
	description={modal === 'new'
		? 'Create a local task for your operations queue.'
		: modal === 'details'
			? 'Send a question to Metro Logistics before deciding.'
			: modal === 'decline'
				? 'Record why this request cannot be approved yet.'
				: modal === 'approve'
					? 'Confirm the settlement amount and evidence.'
					: 'Review available actions for this request.'}
	confirmLabel={modal === 'new'
		? 'Create request'
		: modal === 'details'
			? 'Send question'
			: modal === 'decline'
				? 'Decline request'
				: modal === 'approve'
					? 'Approve $9,700'
					: 'Close'}
	showConfirm={modal !== 'menu'}
	onClose={() => (modal = null)}
	onConfirm={confirmModal}
	>{#if modal === 'new'}<div class="space-y-4">
			<div>
				<label class="cs-label" for="request-type">Request type</label><select
					id="request-type"
					class="cs-input"
					bind:value={newRequestType}
					><option>Milestone review</option><option>Early payment</option><option
						>Settlement failure</option
					></select
				>
			</div>
			<div>
				<label class="cs-label" for="request-title">Request title</label><input
					id="request-title"
					class="cs-input"
					bind:value={newRequestTitle}
					placeholder="Review new evidence"
				/>
			</div>
		</div>{:else if modal === 'details'}<div>
			<label class="cs-label" for="details-question">Question for partner</label><textarea
				id="details-question"
				class="cs-input h-32"
				bind:value={askDraft}
				placeholder="What evidence or context do you need?"></textarea>
		</div>{:else if modal === 'decline'}<div>
			<label class="cs-label" for="decline-reason">Reason</label><textarea
				id="decline-reason"
				class="cs-input h-28"
				placeholder="Explain the decision for the audit trail."></textarea>
		</div>{:else if modal === 'approve'}<div
			class="rounded-xl bg-teal-50 p-4 text-sm text-teal-900"
		>
			<b>$9,700 USDC</b>
			<p class="mt-1">Evidence matches the shipment record and treasury has sufficient balance.</p>
		</div>{:else}<div class="space-y-3 text-sm">
			<button
				class="cs-card-sm flex w-full items-center justify-between p-4 text-left"
				onclick={() => (modal = 'details')}
				>Ask for details <Icon name="arrow-right" size={16} /></button
			><button
				class="cs-card-sm flex w-full items-center justify-between p-4 text-left"
				onclick={() => (modal = 'approve')}>Approve request <Icon name="check" size={16} /></button
			>
		</div>{/if}</DemoModal
>
