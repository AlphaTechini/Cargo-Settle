<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let modal = $state<'account' | 'rebalance' | 'convert' | 'period' | null>(null);
	let accountAdded = $state(false);
	let rebalanceDone = $state(false);
	let conversionDone = $state(false);
	let convertAmount = $state('8500');
	let convertFrom = $state('USDC');
	let convertTo = $state('EURC');
	function confirmModal() {
		if (modal === 'account') accountAdded = true;
		if (modal === 'rebalance') rebalanceDone = true;
		if (modal === 'convert') conversionDone = true;
		modal = null;
	}
</script>

<AppShell
	title="Treasury & FX"
	subtitle="Plan liquidity, convert currencies, and prevent settlement failures"
	active="treasury"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="grid gap-5 xl:grid-cols-[310px_1fr]">
			<aside class="cs-card p-5">
				<div class="flex justify-between">
					<div>
						<h2 class="text-xl font-extrabold">Treasury</h2>
						<p class="cs-muted mt-1 text-xs">Unified operational liquidity</p>
					</div>
					<button class="cs-btn cs-btn-secondary !px-3" onclick={() => (modal = 'account')}
						><Icon name="plus" /></button
					>
				</div>
				<div class="cs-divider mt-6 border-b pb-5">
					<div class="flex justify-between">
						<span class="font-bold">Unified USDC</span><b>$148,200</b>
					</div>
					<div class="mt-3 space-y-3 text-sm">
						<div class="flex justify-between">
							<span class="cs-muted">Arc Testnet</span><b>$72,500</b>
						</div>
						<div class="flex justify-between">
							<span class="cs-muted">Base Sepolia</span><b>$41,300</b>
						</div>
						<div class="flex justify-between">
							<span class="cs-muted">Solana Devnet</span><b>$34,400</b>
						</div>
					</div>
				</div>
				<div class="cs-divider border-b py-5">
					<div class="flex justify-between">
						<span class="font-bold">EURC</span><b>EURC 28,650</b>
					</div>
					<p class="cs-muted mt-2 text-xs">Arc Testnet</p>
				</div>
				<div class="space-y-3 pt-5">
					<div class="flex justify-between">
						<span class="cs-muted">Reserved</span><b>$96,000</b>
					</div>
					<div class="flex justify-between">
						<span class="cs-muted">Available</span><b>$52,200</b>
					</div>
				</div>
			</aside>
			<section class="space-y-5">
				<div class="cs-card p-6">
					<div class="flex flex-wrap justify-between gap-4">
						<div>
							<p class="cs-muted text-xs font-bold tracking-wider uppercase">Liquidity plan</p>
							<h2 class="mt-2 text-2xl font-extrabold">Next 7 days</h2>
						</div>
						<div class="flex gap-2">
							<button class="cs-btn cs-btn-secondary" onclick={() => (modal = 'rebalance')}
								>Rebalance</button
							><button class="cs-btn cs-btn-primary" onclick={() => (modal = 'convert')}
								>Convert currency</button
							>
						</div>
					</div>
					<div class="mt-7 grid items-center gap-7 md:grid-cols-[260px_1fr]">
						<div class="flex items-center gap-5">
							<div
								class="relative h-36 w-36 rounded-full"
								style="background: conic-gradient(#0c7c73 0 58%, #7554d8 58% 76%, #dfe6ea 76% 100%)"
							>
								<div
									class="absolute inset-5 grid place-items-center rounded-full bg-white text-center"
								>
									<div>
										<p class="text-2xl font-extrabold">84%</p>
										<p class="cs-muted text-[.65rem]">covered</p>
									</div>
								</div>
							</div>
							<div class="space-y-3 text-sm">
								<div>
									<span class="mr-2 inline-block h-3 w-3 rounded-full bg-teal-700"></span>Available
								</div>
								<div>
									<span class="mr-2 inline-block h-3 w-3 rounded-full bg-purple-600"></span>Awaiting
									FX
								</div>
								<div>
									<span class="mr-2 inline-block h-3 w-3 rounded-full bg-slate-200"></span>Uncovered
								</div>
							</div>
						</div>
						<div class="grid gap-3 md:grid-cols-2">
							<div class="cs-card-sm p-4">
								<div class="flex justify-between">
									<div>
										<p class="font-bold">USDC obligations</p>
										<p class="cs-muted mt-1 text-xs">$94,300 due</p>
									</div>
									<span class="cs-status cs-status-success">Covered</span>
								</div>
								<div class="cs-progress mt-5"><span style="width: 100%"></span></div>
							</div>
							<div class="cs-card-sm p-4">
								<div class="flex justify-between">
									<div>
										<p class="font-bold">EURC obligations</p>
										<p class="cs-muted mt-1 text-xs">EURC 36,700 due</p>
									</div>
									<span class="cs-status cs-status-warning">EURC 8,050 gap</span>
								</div>
								<div class="cs-progress mt-5">
									<span style="width: 78%; background: #7554d8"></span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="grid gap-5 lg:grid-cols-2">
					<div class="cs-card p-5">
						<div class="flex justify-between">
							<div>
								<h3 class="font-extrabold">Upcoming obligations</h3>
								<p class="cs-muted mt-1 text-xs">Payments that must be ready</p>
							</div>
							<a href="/forwarder-settlements" class="text-sm font-bold text-teal-700">View all</a>
						</div>
						<div class="cs-divider mt-4 divide-y">
							<div class="flex justify-between py-4">
								<div>
									<p class="text-sm font-bold">Rotterdam Port Services</p>
									<p class="cs-muted text-xs">SHP-2048 · Jul 30</p>
								</div>
								<div class="text-right">
									<p class="font-extrabold">EURC 8,500</p>
									<span class="cs-status cs-status-purple">FX required</span>
								</div>
							</div>
							<div class="flex justify-between py-4">
								<div>
									<p class="text-sm font-bold">Atlantic Ocean Lines</p>
									<p class="cs-muted text-xs">SHP-2071 · Jul 31</p>
								</div>
								<div class="text-right">
									<p class="font-extrabold">$24,000</p>
									<span class="cs-status cs-status-danger">Funding gap</span>
								</div>
							</div>
						</div>
					</div>
					<div class="cs-card p-5">
						<div class="flex justify-between">
							<div>
								<h3 class="font-extrabold">Recent FX activity</h3>
								<p class="cs-muted mt-1 text-xs">USDC and EURC conversion</p>
							</div>
							<button class="cs-filter" onclick={() => (modal = 'period')}>Last 30 days</button>
						</div>
						<svg viewBox="0 0 520 180" class="mt-5 h-[190px] w-full"
							><path
								d="M10 150 C80 135,100 90,160 105 S250 150,310 72 S420 50,510 30"
								fill="none"
								stroke="#7554d8"
								stroke-width="4"
							/><path
								d="M10 150 C80 135,100 90,160 105 S250 150,310 72 S420 50,510 30 L510 175 L10 175 Z"
								fill="rgba(117,84,216,.08)"
							/><line x1="10" y1="175" x2="510" y2="175" stroke="#dfe6ea" /></svg
						>
					</div>
				</div>
			</section>
		</div>
		{#if accountAdded || rebalanceDone || conversionDone}<div
				class="mt-4 grid gap-3 md:grid-cols-3"
			>
				{#if accountAdded}<div class="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
						<b>Account connected</b>
						<p class="mt-1">A demo settlement account was added.</p>
					</div>{/if}{#if rebalanceDone}<div
						class="rounded-xl bg-teal-50 p-4 text-sm text-teal-900"
					>
						<b>Rebalance planned</b>
						<p class="mt-1">Liquidity moves are queued locally.</p>
					</div>{/if}{#if conversionDone}<div
						class="rounded-xl bg-purple-50 p-4 text-sm text-purple-900"
					>
						<b>Conversion planned</b>
						<p class="mt-1">{convertAmount} {convertFrom} -> {convertTo} is ready for review.</p>
					</div>{/if}
			</div>{/if}
	</section>
</AppShell>

<DemoModal
	open={modal !== null}
	title={modal === 'account'
		? 'Connect settlement account'
		: modal === 'rebalance'
			? 'Rebalance treasury'
			: modal === 'convert'
				? 'Convert currency'
				: 'FX activity period'}
	description="This local workflow changes only the current page session."
	confirmLabel={modal === 'account'
		? 'Connect account'
		: modal === 'rebalance'
			? 'Plan rebalance'
			: modal === 'convert'
				? 'Prepare conversion'
				: 'Apply period'}
	showConfirm={modal !== 'period'}
	onClose={() => (modal = null)}
	onConfirm={confirmModal}
	>{#if modal === 'account'}<div class="space-y-4">
			<div>
				<label class="cs-label" for="network">Network</label><select id="network" class="cs-input"
					><option>Arc Testnet</option><option>Base Sepolia</option><option>Solana Devnet</option
					></select
				>
			</div>
			<div>
				<label class="cs-label" for="wallet">Settlement wallet</label><input
					id="wallet"
					class="cs-input"
					placeholder="0x..."
				/>
			</div>
		</div>{:else if modal === 'rebalance'}<div class="space-y-4">
			<div class="flex justify-between rounded-xl bg-slate-50 p-4">
				<span>Available USDC</span><b>$52,200</b>
			</div>
			<div>
				<label class="cs-label" for="rebalance-target">Move liquidity to</label><select
					id="rebalance-target"
					class="cs-input"
					><option>EURC reserve</option><option>Arc Testnet operating wallet</option><option
						>Next 7-day obligations</option
					></select
				>
			</div>
			<div>
				<label class="cs-label" for="rebalance-amount">Amount</label><input
					id="rebalance-amount"
					class="cs-input"
					value="8050"
				/>
			</div>
		</div>{:else if modal === 'convert'}<div class="grid gap-4 md:grid-cols-3">
			<div>
				<label class="cs-label" for="convert-amount">Amount</label><input
					id="convert-amount"
					class="cs-input"
					bind:value={convertAmount}
				/>
			</div>
			<div>
				<label class="cs-label" for="convert-from">From</label><select
					id="convert-from"
					class="cs-input"
					bind:value={convertFrom}><option>USDC</option><option>EURC</option></select
				>
			</div>
			<div>
				<label class="cs-label" for="convert-to">To</label><select
					id="convert-to"
					class="cs-input"
					bind:value={convertTo}><option>EURC</option><option>USDC</option></select
				>
			</div>
		</div>
		<div class="mt-4 rounded-xl bg-purple-50 p-4 text-sm text-purple-900">
			<b>Indicative rate 0.9254</b>
			<p class="mt-1">Quote remains local until wallet integration is added.</p>
		</div>{:else}<div>
			<label class="cs-label" for="period">Activity period</label><select
				id="period"
				class="cs-input"
				><option>Last 30 days</option><option>Last 90 days</option><option>Year to date</option
				></select
			>
		</div>{/if}</DemoModal
>
