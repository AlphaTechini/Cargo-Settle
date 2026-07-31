<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let tab = $state('Overview');
	let milestoneVerified = $state(false);
	let modal = $state<'upload' | 'message' | 'bill' | 'customs' | 'fx' | null>(null);
	let documentName = $state('');
	let documentUploaded = $state(false);
	let partnerDraft = $state('');
	let partnerMessageSent = $state(false);
	let fxAmount = $state('8500');
	let fxQuoted = $state(false);
	let fxApplied = $state(false);
	const tabs = ['Overview', 'Obligations', 'Documents', 'Audit trail'];

	function confirmModal() {
		if (modal === 'upload') {
			documentUploaded = true;
			documentName = documentName || 'customs-evidence.pdf';
		} else if (modal === 'message') {
			partnerMessageSent = partnerDraft.trim().length > 0;
		} else if (modal === 'fx') {
			if (fxQuoted) fxApplied = true;
			else fxQuoted = true;
		}
		if (modal !== 'fx' || fxApplied) modal = null;
	}
</script>

<AppShell title="Shipment SHP-2048" subtitle="New York -> Rotterdam" active="shipments">
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="cs-card p-5">
			<div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
				<div>
					<div class="flex items-center gap-3">
						<span class="cs-muted text-xs font-bold tracking-wider uppercase">SHP-2048</span
						><StatusBadge label="In transit" tone="info" />
					</div>
					<h2 class="mt-2 text-2xl font-extrabold">New York -> Rotterdam</h2>
					<p class="cs-muted mt-2 text-sm">
						Atlas Home Imports · Booking NS-88212 · Estimated arrival Aug 2
					</p>
				</div>
				<div class="flex flex-wrap gap-2">
					<button class="cs-btn cs-btn-secondary" onclick={() => (modal = 'upload')}
						><Icon name="upload" size={16} />Upload document</button
					><button class="cs-btn cs-btn-secondary" onclick={() => (modal = 'message')}
						><Icon name="message" size={16} />Message partners</button
					><button
						class="cs-btn cs-btn-primary"
						onclick={() => (milestoneVerified = !milestoneVerified)}
						><Icon name="check-circle" size={16} />{milestoneVerified
							? 'Milestone verified'
							: 'Verify milestone'}</button
					>
				</div>
			</div>
			<div class="mt-7 flex items-center gap-3">
				<div>
					<p class="text-sm font-bold">New York</p>
					<p class="cs-muted text-xs">Jul 21</p>
				</div>
				<div class="cs-route-line flex-1"></div>
				<Icon name="ship" size={28} className="text-teal-700" />
				<div class="cs-route-line flex-1"></div>
				<div class="text-right">
					<p class="text-sm font-bold">Rotterdam</p>
					<p class="cs-muted text-xs">Aug 2</p>
				</div>
			</div>
		</div>
		{#if documentUploaded || partnerMessageSent || fxApplied}<div
				class="mt-4 grid gap-3 md:grid-cols-3"
			>
				{#if documentUploaded}<div class="rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
						<b>Document uploaded</b>
						<p class="mt-1">{documentName}</p>
					</div>{/if}{#if partnerMessageSent}<div
						class="rounded-xl bg-blue-50 p-4 text-sm text-blue-900"
					>
						<b>Partner message sent</b>
						<p class="mt-1">Partners can now review the update.</p>
					</div>{/if}{#if fxApplied}<div
						class="rounded-xl bg-purple-50 p-4 text-sm text-purple-900"
					>
						<b>FX quote applied</b>
						<p class="mt-1">EURC {fxAmount} reserved for settlement.</p>
					</div>{/if}
			</div>{/if}
		<div class="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
			<div class="space-y-5">
				<div class="cs-card overflow-hidden">
					<div class="cs-divider flex gap-5 overflow-x-auto border-b px-5">
						{#each tabs as item (item)}<button
								class={`border-b-2 py-4 text-sm font-bold whitespace-nowrap ${tab === item ? 'border-teal-700 text-teal-700' : 'cs-muted border-transparent'}`}
								onclick={() => (tab = item)}>{item}</button
							>{/each}
					</div>
					{#if tab === 'Overview'}<div class="p-5">
							<div class="grid gap-3 md:grid-cols-4">
								<div class="rounded-xl bg-slate-50 p-4">
									<p class="cs-muted text-xs">Shipment funded</p>
									<p class="mt-2 text-xl font-extrabold">$24,800</p>
								</div>
								<div class="rounded-xl bg-slate-50 p-4">
									<p class="cs-muted text-xs">Settled</p>
									<p class="mt-2 text-xl font-extrabold">$8,000</p>
								</div>
								<div class="rounded-xl bg-slate-50 p-4">
									<p class="cs-muted text-xs">Reserved</p>
									<p class="mt-2 text-xl font-extrabold">$13,900</p>
								</div>
								<div class="rounded-xl bg-slate-50 p-4">
									<p class="cs-muted text-xs">Available</p>
									<p class="mt-2 text-xl font-extrabold">$2,900</p>
								</div>
							</div>
							<h3 class="mt-7 font-extrabold">Shipment milestones</h3>
							<div class="mt-4 space-y-1">
								<div class="flex gap-4">
									<div class="flex flex-col items-center">
										<span
											class="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700"
											><Icon name="check" size={16} /></span
										><span class="h-16 w-px bg-slate-200"></span>
									</div>
									<div class="pb-5">
										<div class="flex items-center gap-2">
											<p class="font-bold">Cargo loaded</p>
											<StatusBadge label="Verified" tone="success" />
										</div>
										<p class="cs-muted mt-1 text-sm">Jul 22 · Ocean carrier payment released</p>
									</div>
								</div>
								<div class="flex gap-4">
									<div class="flex flex-col items-center">
										<span
											class="grid h-8 w-8 place-items-center rounded-full bg-purple-100 text-purple-700"
											><Icon name="file" size={16} /></span
										><span class="h-16 w-px bg-slate-200"></span>
									</div>
									<div class="pb-5">
										<div class="flex items-center gap-2">
											<p class="font-bold">Customs cleared</p>
											<StatusBadge label="Evidence submitted" tone="purple" />
										</div>
										<p class="cs-muted mt-1 text-sm">
											Port agent submitted customs release document
										</p>
									</div>
								</div>
								<div class="flex gap-4">
									<span class="h-8 w-8 rounded-full border-2 border-slate-300"></span>
									<div>
										<p class="font-bold">Final delivery</p>
										<p class="cs-muted mt-1 text-sm">
											Expected Aug 4 · Unlocks trucking obligation
										</p>
									</div>
								</div>
							</div>
						</div>{:else if tab === 'Obligations'}<div class="overflow-x-auto">
							<table class="cs-table min-w-[700px]">
								<thead
									><tr
										><th>Partner</th><th>Milestone</th><th>Amount</th><th>Currency</th><th
											>Status</th
										></tr
									></thead
								><tbody
									><tr
										><td
											><b>Atlantic Ocean Lines</b><br /><span class="cs-muted text-xs"
												>Ocean carrier</span
											></td
										><td>Cargo loaded</td><td class="font-bold">$8,000</td><td>USDC</td><td
											><StatusBadge label="Paid" tone="success" /></td
										></tr
									><tr
										><td
											><b>Rotterdam Port Services</b><br /><span class="cs-muted text-xs"
												>Port agent</span
											></td
										><td>Customs cleared</td><td class="font-bold">EURC 8,500</td><td>EURC</td><td
											><StatusBadge label="FX required" tone="purple" /></td
										></tr
									><tr
										><td
											><b>Metro Logistics</b><br /><span class="cs-muted text-xs">Trucking</span
											></td
										><td>Final delivery</td><td class="font-bold">$9,700</td><td>USDC</td><td
											><StatusBadge label="Pending" tone="neutral" /></td
										></tr
									></tbody
								>
							</table>
						</div>{:else if tab === 'Documents'}<div class="grid gap-3 p-5 md:grid-cols-2">
							<button
								class="cs-card-sm flex items-center gap-3 p-4 text-left"
								onclick={() => (modal = 'bill')}
								><Icon name="file" className="text-red-600" />
								<div>
									<p class="text-sm font-bold">Bill of lading.pdf</p>
									<p class="cs-muted text-xs">Uploaded Jul 21</p>
								</div></button
							><button
								class="cs-card-sm flex items-center gap-3 p-4 text-left"
								onclick={() => (modal = 'customs')}
								><Icon name="file" className="text-blue-600" />
								<div>
									<p class="text-sm font-bold">Customs release.pdf</p>
									<p class="cs-muted text-xs">Awaiting review</p>
								</div></button
							>
						</div>{:else}<div class="space-y-4 p-5 text-sm">
							<p><b>Jul 29, 09:18</b> · Customs evidence submitted by Rotterdam Port Services.</p>
							<p><b>Jul 22, 15:02</b> · 8,000 USDC settled to Atlantic Ocean Lines.</p>
							<p><b>Jul 21, 10:41</b> · Shipment funded by Atlas Home Imports.</p>
						</div>{/if}
				</div>
				<div class="cs-card p-5">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="font-extrabold">Obligations</h3>
							<p class="cs-muted mt-1 text-xs">Commercial payments attached to this shipment</p>
						</div>
						<a href="/forwarder-obligation-create" class="cs-btn cs-btn-secondary"
							><Icon name="plus" size={16} />Add obligation</a
						>
					</div>
					<div class="cs-divider mt-4 divide-y">
						<div class="flex items-center gap-3 py-4">
							<Icon name="ship" className="text-emerald-700" />
							<div>
								<p class="font-bold">Atlantic Ocean Lines</p>
								<p class="cs-muted text-xs">Ocean carrier · Cargo loaded</p>
							</div>
							<p class="ml-auto font-extrabold">$8,000</p>
							<StatusBadge label="Paid" tone="success" />
						</div>
						<div class="flex items-center gap-3 py-4">
							<Icon name="building" className="text-purple-700" />
							<div>
								<p class="font-bold">Rotterdam Port Services</p>
								<p class="cs-muted text-xs">Port agent · Customs cleared</p>
							</div>
							<p class="ml-auto font-extrabold">EURC 8,500</p>
							<StatusBadge label="FX required" tone="purple" />
						</div>
					</div>
				</div>
			</div>
			<div class="space-y-5">
				<div class="cs-card p-5">
					<h3 class="font-extrabold">Settlement readiness</h3>
					<div class="mt-5 flex items-center gap-4">
						<div
							class="h-16 w-16 rounded-full border-[9px] border-teal-600 border-b-slate-200"
						></div>
						<div>
							<p class="text-3xl font-extrabold">72%</p>
							<p class="cs-muted text-xs">of obligations funded</p>
						</div>
					</div>
					<div class="mt-5 space-y-3 text-sm">
						<div class="flex justify-between">
							<span class="cs-muted">Available USDC</span><b>$16,300</b>
						</div>
						<div class="flex justify-between">
							<span class="cs-muted">Required EURC</span><b>EURC 8,500</b>
						</div>
						<div class="flex justify-between">
							<span class="cs-muted">FX quote expires</span><b>04:31</b>
						</div>
					</div>
					<button class="cs-btn cs-btn-primary mt-5 w-full" onclick={() => (modal = 'fx')}
						>Review FX conversion</button
					>
				</div>
				<div class="cs-card p-5">
					<h3 class="font-extrabold">Participants</h3>
					<div class="mt-4 space-y-4">
						<div class="flex items-center gap-3">
							<div
								class="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xs font-bold"
							>
								AH
							</div>
							<div>
								<p class="text-sm font-bold">Atlas Home Imports</p>
								<p class="cs-muted text-xs">Shipper</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div
								class="grid h-9 w-9 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-800"
							>
								NF
							</div>
							<div>
								<p class="text-sm font-bold">Northstar Freight</p>
								<p class="cs-muted text-xs">Forwarder</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div
								class="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-800"
							>
								+3
							</div>
							<div>
								<p class="text-sm font-bold">Logistics partners</p>
								<p class="cs-muted text-xs">Carrier, port agent, trucker</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</AppShell>

<DemoModal
	open={modal !== null}
	title={modal === 'upload'
		? 'Upload shipment document'
		: modal === 'message'
			? 'Message partners'
			: modal === 'bill'
				? 'Bill of lading preview'
				: modal === 'customs'
					? 'Customs release preview'
					: 'Review FX conversion'}
	description={modal === 'upload'
		? 'Attach evidence to the shipment record.'
		: modal === 'message'
			? 'Send an operational update to the shipment participants.'
			: modal === 'fx'
				? 'Review the local quote before reserving EURC.'
				: 'Review the document attached to SHP-2048.'}
	confirmLabel={modal === 'upload'
		? 'Attach document'
		: modal === 'message'
			? 'Send message'
			: modal === 'fx'
				? fxQuoted
					? 'Apply quote'
					: 'Get quote'
				: 'Close preview'}
	showConfirm={modal === 'bill' || modal === 'customs' ? false : true}
	onClose={() => (modal = null)}
	onConfirm={confirmModal}
>
	{#if modal === 'upload'}
		<label class="cs-label" for="shipment-file">Document file</label><input
			id="shipment-file"
			class="cs-input"
			type="file"
			onchange={(event) => (documentName = event.currentTarget.files?.[0]?.name ?? '')}
		/>
		<p class="cs-muted mt-3 text-xs">The selected file is held in memory for this demo.</p>
	{:else if modal === 'message'}
		<label class="cs-label" for="partner-message">Message</label><textarea
			id="partner-message"
			class="cs-input h-32"
			bind:value={partnerDraft}
			placeholder="Share an operational update..."></textarea>
	{:else if modal === 'fx'}
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label class="cs-label" for="fx-amount">EURC amount</label><input
					id="fx-amount"
					class="cs-input"
					bind:value={fxAmount}
				/>
			</div>
			<div>
				<label class="cs-label" for="fx-rate">Indicative rate</label><input
					id="fx-rate"
					class="cs-input"
					value="0.9254"
					readonly
				/>
			</div>
		</div>
		{#if fxQuoted}<div class="mt-4 rounded-xl bg-purple-50 p-4 text-sm text-purple-900">
				<b>Quote ready</b>
				<p class="mt-1">8,500 USDC -> EURC {fxAmount} · expires in 04:31.</p>
			</div>{/if}
	{:else if modal === 'bill'}
		<div class="rounded-xl bg-slate-50 p-5">
			<p class="cs-muted text-xs font-bold tracking-wider uppercase">Bill of lading.pdf</p>
			<p class="mt-4 font-extrabold">Ocean carrier release document</p>
			<p class="cs-muted mt-2 text-sm">Uploaded Jul 21 · Verified against booking NS-88212.</p>
		</div>
	{:else if modal === 'customs'}
		<div class="rounded-xl bg-slate-50 p-5">
			<p class="cs-muted text-xs font-bold tracking-wider uppercase">Customs release.pdf</p>
			<p class="mt-4 font-extrabold">Rotterdam customs evidence</p>
			<p class="cs-muted mt-2 text-sm">Awaiting review · Submitted by Rotterdam Port Services.</p>
		</div>
	{/if}
</DemoModal>
