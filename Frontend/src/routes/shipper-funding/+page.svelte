<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let funded = $state(false);
	let changeModal = $state(false);
	let changeRequested = $state(false);
	let changeReason = $state('');

	function fund() {
		funded = true;
	}
</script>

<AppShell
	title="Funding request"
	subtitle="Review how your payment will be allocated"
	active="funding"
	role="shipper"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_360px]">
			<section class="space-y-5">
				<div class="cs-card p-6">
					<div class="flex justify-between gap-4">
						<div>
							<span class="text-xs font-extrabold tracking-wider text-amber-700 uppercase"
								>Funding request</span
							>
							<h2 class="mt-2 text-2xl font-extrabold">SHP-2089 · Miami -> Antwerp</h2>
							<p class="cs-muted mt-2 text-sm">Requested by Northstar Freight · Due Jul 30</p>
						</div>
						<StatusBadge
							label={funded ? 'Funded' : 'Awaiting funding'}
							tone={funded ? 'success' : 'warning'}
						/>
					</div>
					<div class="mt-7 grid gap-3 md:grid-cols-3">
						<div class="rounded-xl bg-slate-50 p-4">
							<p class="cs-muted text-xs">Requested amount</p>
							<p class="mt-2 text-2xl font-extrabold">$17,200</p>
						</div>
						<div class="rounded-xl bg-slate-50 p-4">
							<p class="cs-muted text-xs">Partners</p>
							<p class="mt-2 text-2xl font-extrabold">4</p>
						</div>
						<div class="rounded-xl bg-slate-50 p-4">
							<p class="cs-muted text-xs">Currencies</p>
							<p class="mt-2 text-2xl font-extrabold">USDC + EURC</p>
						</div>
					</div>
				</div>
				<div class="cs-card p-6">
					<h3 class="font-extrabold">Planned allocation</h3>
					<div class="cs-divider mt-4 divide-y">
						<div class="flex justify-between py-4">
							<div>
								<p class="font-bold">Atlantic Ocean Lines</p>
								<p class="cs-muted mt-1 text-xs">Ocean carrier · Cargo loaded</p>
							</div>
							<p class="font-extrabold">$7,800 USDC</p>
						</div>
						<div class="flex justify-between py-4">
							<div>
								<p class="font-bold">Antwerp Port Services</p>
								<p class="cs-muted mt-1 text-xs">Port agent · Customs cleared</p>
							</div>
							<p class="font-extrabold">EURC 3,200</p>
						</div>
						<div class="flex justify-between py-4">
							<div>
								<p class="font-bold">Metro Logistics EU</p>
								<p class="cs-muted mt-1 text-xs">Final delivery</p>
							</div>
							<p class="font-extrabold">$4,100 USDC</p>
						</div>
					</div>
				</div>
			</section>
			<aside class="cs-card h-fit p-6">
				<h3 class="font-extrabold">Fund shipment</h3>
				<div class="mt-5">
					<label class="cs-label" for="source">Funding source</label><select
						id="source"
						class="cs-input"><option>Circle wallet · 0x71F...88a2</option></select
					>
				</div>
				<div class="mt-4">
					<label class="cs-label" for="amount">Amount</label><input
						id="amount"
						class="cs-input"
						value="17,200.00"
					/>
				</div>
				<div class="mt-4">
					<label class="cs-label" for="currency">Currency</label><select
						id="currency"
						class="cs-input"><option>USDC</option></select
					>
				</div>
				<div class="cs-card-sm mt-5 p-4 text-sm">
					<div class="flex justify-between">
						<span class="cs-muted">Amount</span><b>$17,200.00</b>
					</div>
					<div class="mt-3 flex justify-between">
						<span class="cs-muted">Network fee</span><b>Sponsored</b>
					</div>
					<div class="cs-divider mt-3 flex justify-between border-t pt-3">
						<span class="font-bold">Total</span><b>$17,200.00</b>
					</div>
				</div>
				<button class="cs-btn cs-btn-primary mt-5 w-full" onclick={fund} disabled={funded}
					><Icon name="wallet" size={16} />{funded ? 'Funded' : 'Fund shipment'}</button
				><button
					class="cs-btn cs-btn-secondary mt-2 w-full"
					onclick={() => (changeModal = true)}
					disabled={funded}>Request changes</button
				>{#if funded}<div class="mt-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-900">
						<b>Funding recorded</b>
						<p class="mt-1">$17,200 is allocated to the shipment in this page session.</p>
					</div>{/if}{#if changeRequested}<div
						class="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
					>
						<b>Change request sent</b>
						<p class="mt-1">The forwarder will review your note.</p>
					</div>{/if}
			</aside>
		</div>
	</section>
</AppShell>

<DemoModal
	open={changeModal}
	title="Request funding changes"
	description="Send a note to Northstar Freight before funding."
	confirmLabel="Send request"
	onClose={() => (changeModal = false)}
	onConfirm={() => {
		changeRequested = changeReason.trim().length > 0;
		if (changeRequested) changeModal = false;
	}}
	><label class="cs-label" for="change-reason">What should change?</label><textarea
		id="change-reason"
		class="cs-input h-32"
		bind:value={changeReason}
		placeholder="Explain which allocation or amount needs review."></textarea></DemoModal
>
