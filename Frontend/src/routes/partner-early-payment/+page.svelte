<script lang="ts">
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let accepted = $state(false);
	let declined = $state(false);
	let understood = $state(false);
	let modal = $state(false);
	let error = $state('');

	function accept() {
		error = understood ? '' : 'Confirm that you understand the $300 fee before accepting.';
		if (understood) accepted = true;
	}
</script>

<AppShell
	title="Early payment"
	subtitle="Access approved shipment value before the original due date"
	active="early-payment"
	role="partner"
>
	<section class="mx-auto max-w-[1500px] p-5 lg:p-8">
		<div class="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_360px]">
			<section class="cs-card p-6">
				<div class="flex items-start justify-between gap-4">
					<div>
						<span class="text-xs font-extrabold tracking-wider text-purple-700 uppercase"
							>Early payment offer</span
						>
						<h2 class="mt-2 text-2xl font-extrabold">Receive $9,700 today</h2>
						<p class="cs-muted mt-2 text-sm">
							Against your approved $10,000 obligation for shipment SHP-2048.
						</p>
					</div>
					<StatusBadge
						label={accepted ? 'Accepted' : declined ? 'Declined' : 'Eligible'}
						tone={accepted ? 'success' : declined ? 'danger' : 'success'}
					/>
				</div>
				<div class="mt-7 grid gap-3 md:grid-cols-3">
					<div class="rounded-xl bg-slate-50 p-4">
						<p class="cs-muted text-xs">Earned amount</p>
						<p class="mt-2 text-2xl font-extrabold">$10,000</p>
					</div>
					<div class="rounded-xl bg-slate-50 p-4">
						<p class="cs-muted text-xs">Receive today</p>
						<p class="mt-2 text-2xl font-extrabold">$9,700</p>
					</div>
					<div class="rounded-xl bg-slate-50 p-4">
						<p class="cs-muted text-xs">Financing fee</p>
						<p class="mt-2 text-2xl font-extrabold">$300</p>
					</div>
				</div>
				<div class="mt-7">
					<h3 class="font-extrabold">How it works</h3>
					<div class="mt-4 space-y-5">
						<div class="flex gap-4">
							<span
								class="grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-sm font-bold text-teal-700"
								>1</span
							>
							<div>
								<p class="font-bold">You receive $9,700 USDC now</p>
								<p class="cs-muted mt-1 text-sm">
									CargoSettle sends the early-payment amount to your verified settlement wallet.
								</p>
							</div>
						</div>
						<div class="flex gap-4">
							<span
								class="grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-sm font-bold text-teal-700"
								>2</span
							>
							<div>
								<p class="font-bold">The obligation is assigned to the funding partner</p>
								<p class="cs-muted mt-1 text-sm">
									The approved shipment receivable remains linked to the original commercial record.
								</p>
							</div>
						</div>
						<div class="flex gap-4">
							<span
								class="grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-sm font-bold text-teal-700"
								>3</span
							>
							<div>
								<p class="font-bold">The funder receives $10,000 on Aug 29</p>
								<p class="cs-muted mt-1 text-sm">
									You have no additional repayment action after assignment.
								</p>
							</div>
						</div>
					</div>
				</div>
				<div class="cs-card-sm mt-7 flex gap-3 bg-amber-50/50 p-4">
					<Icon name="info" size={20} className="text-amber-700" />
					<p class="text-sm">
						This demo presents a programmable early-payment workflow. Production financing would be
						provided through licensed partners.
					</p>
				</div>
			</section>
			<aside class="cs-card h-fit p-6">
				<h3 class="font-extrabold">Confirm early payment</h3>
				<div class="mt-5 space-y-4 text-sm">
					<div class="flex justify-between">
						<span class="cs-muted">Settlement wallet</span><b>0x8c4...91F2</b>
					</div>
					<div class="flex justify-between"><span class="cs-muted">Currency</span><b>USDC</b></div>
					<div class="flex justify-between">
						<span class="cs-muted">Network</span><b>Arc Testnet</b>
					</div>
					<div class="flex justify-between">
						<span class="cs-muted">Expected confirmation</span><b>&lt; 3 seconds</b>
					</div>
				</div>
				<label class="mt-6 flex gap-3 text-sm"
					><input type="checkbox" bind:checked={understood} class="mt-1 accent-teal-700" />I
					understand the $300 fee and receivable assignment.</label
				><button
					class="cs-btn cs-btn-primary mt-6 w-full"
					onclick={accept}
					disabled={accepted || declined}
				>
					<Icon name="check" size={16} />{accepted
						? 'Accepted'
						: 'Accept and receive $9,700'}</button
				><button
					class="cs-btn cs-btn-secondary mt-2 w-full"
					onclick={() => (modal = true)}
					disabled={accepted || declined}>Decline offer</button
				>{#if error}<p class="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-900">{error}</p>{/if}
			</aside>
		</div>
	</section>
</AppShell>

<DemoModal
	open={modal}
	title="Decline early payment"
	description="Record a reason for declining this receivable offer."
	confirmLabel="Decline offer"
	onClose={() => (modal = false)}
	onConfirm={() => {
		declined = true;
		modal = false;
	}}
	><label class="cs-label" for="decline-note">Reason</label><textarea
		id="decline-note"
		class="cs-input h-28"
		placeholder="Explain why you are not accepting the offer."></textarea></DemoModal
>
