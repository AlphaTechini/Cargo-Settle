<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let step = $state(1);
	let saved = $state(false);
	let origin = $state('');
	let destination = $state('');
	let reference = $state('SHP-2089');
	const steps = ['Shipment details', 'Partners', 'Funding'];

	function continueStep() {
		if (step < 3) step += 1;
		else saved = true;
	}
</script>

<AppShell title="Create shipment" subtitle={`Step ${step} of 3`} active="shipments">
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="mx-auto max-w-5xl">
			<div class="mb-8 flex items-center justify-between gap-2">
				{#each steps as label, index (label)}<div class="flex min-w-0 items-center gap-2">
						<span
							class={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${step >= index + 1 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'}`}
							>{index + 1}</span
						>
						<div class="hidden sm:block">
							<p class="text-sm font-bold">{label}</p>
							<p class="cs-muted text-xs">
								{index === 0
									? 'Route and client'
									: index === 1
										? 'Assign services'
										: 'Review and create'}
							</p>
						</div>
					</div>
					{#if index < steps.length - 1}<div
							class="mx-2 h-px flex-1 bg-slate-200"
						></div>{/if}{/each}
			</div>
			<div class="cs-card p-6">
				{#if step === 1}<h2 class="text-xl font-extrabold">Shipment details</h2>
					<p class="cs-muted mt-1 text-sm">
						Create the commercial record that will hold milestones and payment obligations.
					</p>
					<div class="mt-7 grid gap-5 md:grid-cols-2">
						<div>
							<label class="cs-label" for="client">Shipper client</label><select
								id="client"
								class="cs-input"
								><option>Atlas Home Imports</option><option>Pioneer Retail Group</option></select
							>
						</div>
						<div>
							<label class="cs-label" for="reference">Internal shipment reference</label><input
								id="reference"
								class="cs-input"
								bind:value={reference}
							/>
						</div>
						<div>
							<label class="cs-label" for="origin">Origin</label><input
								id="origin"
								class="cs-input"
								bind:value={origin}
								placeholder="New York, United States"
							/>
						</div>
						<div>
							<label class="cs-label" for="destination">Destination</label><input
								id="destination"
								class="cs-input"
								bind:value={destination}
								placeholder="Rotterdam, Netherlands"
							/>
						</div>
						<div>
							<label class="cs-label" for="mode">Mode</label><select id="mode" class="cs-input"
								><option>Ocean freight</option><option>Air freight</option><option
									>Road freight</option
								></select
							>
						</div>
						<div>
							<label class="cs-label" for="cargo">Cargo type</label><input
								id="cargo"
								class="cs-input"
								placeholder="Furniture and household goods"
							/>
						</div>
						<div>
							<label class="cs-label" for="departure">Estimated departure</label><input
								id="departure"
								type="date"
								class="cs-input"
							/>
						</div>
						<div>
							<label class="cs-label" for="arrival">Estimated arrival</label><input
								id="arrival"
								type="date"
								class="cs-input"
							/>
						</div>
						<div class="md:col-span-2">
							<label class="cs-label" for="value">Shipment value</label>
							<div class="grid grid-cols-[1fr_130px] gap-3">
								<input id="value" class="cs-input" value="24,800" /><select class="cs-input"
									><option>USDC</option><option>EURC</option></select
								>
							</div>
						</div>
						<div class="md:col-span-2">
							<label class="cs-label" for="notes">Commercial notes</label><textarea
								id="notes"
								class="cs-input h-28"
								placeholder="Customer requirements, references, or operational context"></textarea>
						</div>
					</div>{:else if step === 2}<h2 class="text-xl font-extrabold">Assign partners</h2>
					<p class="cs-muted mt-1 text-sm">
						Choose the service providers that will receive obligations on this shipment.
					</p>
					<div class="mt-7 space-y-3">
						<label class="cs-card-sm flex items-center gap-4 p-4"
							><input type="checkbox" checked /><span
								class="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"
								><Icon name="ship" /></span
							><span class="flex-1"
								><b>Atlantic Ocean Lines</b><small class="cs-muted block text-xs"
									>Ocean carrier · Cargo loaded</small
								></span
							><span class="font-bold">$8,000</span></label
						><label class="cs-card-sm flex items-center gap-4 p-4"
							><input type="checkbox" checked /><span
								class="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-700"
								><Icon name="building" /></span
							><span class="flex-1"
								><b>Rotterdam Port Services</b><small class="cs-muted block text-xs"
									>Port agent · Customs cleared</small
								></span
							><span class="font-bold">EURC 8,500</span></label
						><label class="cs-card-sm flex items-center gap-4 p-4"
							><input type="checkbox" /><span
								class="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700"
								><Icon name="truck" /></span
							><span class="flex-1"
								><b>Metro Logistics</b><small class="cs-muted block text-xs"
									>Trucking · Final delivery</small
								></span
							><span class="font-bold">$9,700</span></label
						>
					</div>
					<a class="mt-5 inline-flex font-bold text-teal-700" href="/forwarder-partner-directory"
						>Browse partner network <Icon name="arrow-right" size={16} /></a
					>{:else}<h2 class="text-xl font-extrabold">Review and fund</h2>
					<p class="cs-muted mt-1 text-sm">
						Confirm the shipment record before creating the demo workflow.
					</p>
					<div class="mt-7 grid gap-4 md:grid-cols-3">
						<div class="rounded-xl bg-slate-50 p-4">
							<p class="cs-muted text-xs">Reference</p>
							<p class="mt-1 font-extrabold">{reference}</p>
						</div>
						<div class="rounded-xl bg-slate-50 p-4">
							<p class="cs-muted text-xs">Route</p>
							<p class="mt-1 font-extrabold">
								{origin || 'New York'} -> {destination || 'Rotterdam'}
							</p>
						</div>
						<div class="rounded-xl bg-slate-50 p-4">
							<p class="cs-muted text-xs">Shipment value</p>
							<p class="mt-1 font-extrabold">$24,800 USDC</p>
						</div>
					</div>
					{#if saved}<div class="mt-5 rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
							Shipment created for this page session. Persistence will be wired in the backend pass.
						</div>{/if}{/if}
				<div class="cs-divider mt-8 flex justify-between border-t pt-5">
					<button class="cs-btn cs-btn-secondary" disabled={step === 1} onclick={() => (step -= 1)}
						>Back</button
					>
					<div class="flex gap-2">
						<button class="cs-btn cs-btn-secondary" onclick={() => (saved = true)}
							>Save draft</button
						><button class="cs-btn cs-btn-primary" onclick={continueStep}
							>{step === 3 ? 'Create shipment' : 'Continue'}
							<Icon name="arrow-right" size={16} /></button
						>
					</div>
				</div>
			</div>
		</div>
	</section>
</AppShell>
