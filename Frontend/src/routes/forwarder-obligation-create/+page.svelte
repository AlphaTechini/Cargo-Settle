<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';

	let amount = $state('8,500.00');
	let allowEarly = $state(true);
	let savedType = $state<'Draft' | 'Obligation' | ''>('');
	let documentName = $state('Invoice RP-88219');

	function save(action: string) {
		savedType = action as 'Draft' | 'Obligation';
	}
</script>

<AppShell title="Create obligation" subtitle="SHP-2048 · New York -> Rotterdam" active="shipments">
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="cs-card grid min-h-[720px] overflow-hidden lg:grid-cols-[420px_1fr]">
			<section
				class="cs-divider flex flex-col items-center justify-center border-b bg-[#eef2f3] p-6 lg:border-r lg:border-b-0"
			>
				<div class="w-full max-w-[310px] bg-white p-6 shadow-lg">
					<p class="cs-muted text-xs">INVOICE</p>
					<h3 class="mt-3 text-xl font-extrabold">Rotterdam Port Services</h3>
					<div class="mt-8 space-y-3 text-sm">
						<div class="flex justify-between"><span>Customs handling</span><b>EURC 6,500</b></div>
						<div class="flex justify-between"><span>Port documentation</span><b>EURC 2,000</b></div>
						<div class="cs-divider flex justify-between border-t pt-3">
							<span class="font-bold">Total</span><b class="text-lg">EURC 8,500</b>
						</div>
					</div>
					<p class="cs-muted mt-10 text-xs">{documentName} · Due Aug 2, 2026</p>
				</div>
				<div class="mt-5 flex gap-2">
					<button
						class="cs-btn cs-btn-secondary"
						onclick={() => (documentName = 'Replacement invoice RP-88219')}>Replace</button
					><button
						class="cs-btn cs-btn-danger"
						onclick={() => (documentName = 'No invoice attached')}>Remove</button
					>
				</div>
			</section>
			<section class="p-6 lg:p-8">
				<h2 class="text-2xl font-extrabold">Create payment obligation</h2>
				<p class="cs-muted mt-2 text-sm">Attach a commercial payment to shipment SHP-2048.</p>
				<div class="mt-7 grid gap-5 md:grid-cols-2">
					<div class="md:col-span-2">
						<label class="cs-label" for="partner">Logistics partner</label><select
							id="partner"
							class="cs-input"
							><option>Rotterdam Port Services</option><option>Atlantic Ocean Lines</option></select
						>
					</div>
					<div>
						<label class="cs-label" for="amount">Amount</label><input
							id="amount"
							class="cs-input"
							bind:value={amount}
						/>
					</div>
					<div>
						<label class="cs-label" for="currency">Settlement currency</label><select
							id="currency"
							class="cs-input"><option>EURC</option><option>USDC</option></select
						>
					</div>
					<div>
						<label class="cs-label" for="invoice">Invoice number</label><input
							id="invoice"
							class="cs-input"
							value="RP-88219"
						/>
					</div>
					<div>
						<label class="cs-label" for="due">Contractual due date</label><input
							id="due"
							type="date"
							class="cs-input"
						/>
					</div>
					<div>
						<label class="cs-label" for="milestone">Release milestone</label><select
							id="milestone"
							class="cs-input"
							><option>Customs cleared</option><option>Cargo loaded</option><option
								>Final delivery</option
							></select
						>
					</div>
					<div>
						<label class="cs-label" for="service">Service type</label><select
							id="service"
							class="cs-input"
							><option>Port handling</option><option>Customs brokerage</option></select
						>
					</div>
					<div class="md:col-span-2">
						<label class="cs-label" for="note">Internal note</label><textarea
							id="note"
							class="cs-input h-24">Includes customs handling and port documentation.</textarea
						>
					</div>
					<label class="cs-card-sm flex items-center justify-between gap-4 p-4 md:col-span-2"
						><span
							><b>Allow early payment</b><small class="cs-muted mt-1 block text-xs"
								>Partner may request settlement before the original due date.</small
							></span
						><input
							type="checkbox"
							bind:checked={allowEarly}
							class="h-5 w-5 accent-teal-700"
						/></label
					>
				</div>
				<div class="cs-divider mt-8 flex justify-end gap-2 border-t pt-5">
					<button class="cs-btn cs-btn-secondary" onclick={() => save('Draft')}>Save draft</button
					><button class="cs-btn cs-btn-primary" onclick={() => save('Obligation')}
						>Add obligation</button
					>
				</div>
				{#if savedType}<div
						class="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900"
					>
						<div class="flex items-start gap-3">
							<span class="grid h-9 w-9 place-items-center rounded-xl bg-white text-teal-700"
								><span class="text-lg">{savedType === 'Obligation' ? '✓' : '•'}</span></span
							>
							<div>
								<p class="font-bold">
									{savedType === 'Obligation' ? 'Payment obligation added' : 'Draft saved'}
								</p>
								<p class="mt-1">
									{documentName} · {amount} · Early payment {allowEarly ? 'enabled' : 'disabled'}.
								</p>
								<a
									class="mt-2 inline-block font-bold text-teal-700"
									href="/forwarder-shipment-detail">Review shipment obligations</a
								>
							</div>
						</div>
					</div>{/if}
			</section>
		</div>
	</section>
</AppShell>
