<script lang="ts">
	import { page } from '$app/state';
	import { createShipment, getWorkspaceMembers, type WorkspaceMember } from '$lib/shipments';
	import AppShell from '$lib/components/AppShell.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let step = $state(1);
	let saved = $state(false);
	let submitting = $state(false);
	let error = $state('');
	let origin = $state('');
	let destination = $state('');
	let reference = $state('');
	let clientId = $state('');
	let mode = $state('ocean');
	let cargoDescription = $state('');
	let estimatedDeparture = $state('');
	let estimatedArrival = $state('');
	let notes = $state('');
	let members = $state<WorkspaceMember[]>([]);
	let createdShipmentId = $state('');
	let loadedWorkspaceId = $state('');
	let workspaceId = $derived(page.data.activeWorkspace?.id ?? '');
	let currentUserId = $derived(page.data.user?.id ?? '');
	let shippers = $derived(members.filter((member) => member.businessRole === 'shipper'));
	const steps = ['Shipment details', 'Partners', 'Funding'];

	$effect(() => {
		if (!workspaceId || workspaceId === loadedWorkspaceId) return;
		loadedWorkspaceId = workspaceId;
		void loadMembers();
	});

	async function loadMembers() {
		try {
			members = (await getWorkspaceMembers(workspaceId)).members;
			clientId = members.find((member) => member.businessRole === 'shipper')?.userId ?? '';
		} catch (requestError) {
			error =
				requestError instanceof Error ? requestError.message : 'Unable to load workspace members';
		}
	}

	function validateDetails() {
		if (!workspaceId || !currentUserId)
			return 'Sign in and select a workspace before creating a shipment.';
		if (!clientId) return 'Select a shipper client.';
		if (!origin.trim() || !destination.trim()) return 'Origin and destination are required.';
		return '';
	}

	async function submitShipment() {
		if (saved) return;
		error = validateDetails();
		if (error) return;
		submitting = true;
		try {
			const result = await createShipment({
				workspaceId,
				shipperId: clientId,
				freightForwarderId: currentUserId,
				origin,
				destination,
				mode,
				cargoDescription: cargoDescription || null,
				externalReference: reference || null,
				estimatedDeparture: estimatedDeparture || null,
				estimatedArrival: estimatedArrival || null,
				notes: notes || null,
				milestones: [
					{ key: 'departure', label: 'Departure', sequence: 1 },
					{ key: 'delivery', label: 'Final delivery', sequence: 2, evidenceRequired: true }
				]
			});
			createdShipmentId = result.shipment.id;
			saved = true;
		} catch (requestError) {
			error = requestError instanceof Error ? requestError.message : 'Unable to create shipment';
		} finally {
			submitting = false;
		}
	}

	async function continueStep() {
		if (step === 1) {
			error = validateDetails();
			if (error) return;
		}
		if (step < 3) step += 1;
		else await submitShipment();
	}
</script>

<AppShell title="Create shipment" subtitle={`Step ${step} of 3`} active="shipments">
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		<div class="mx-auto max-w-5xl">
			<div class="mb-8 flex items-center justify-between gap-2">
				{#each steps as label, index (label)}
					<div class="flex min-w-0 items-center gap-2">
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
					{#if index < steps.length - 1}<div class="mx-2 h-px flex-1 bg-slate-200"></div>{/if}
				{/each}
			</div>
			<div class="cs-card p-6">
				{#if step === 1}
					<h2 class="text-xl font-extrabold">Shipment details</h2>
					<p class="cs-muted mt-1 text-sm">
						Create the commercial record that will hold milestones and payment obligations.
					</p>
					<div class="mt-7 grid gap-5 md:grid-cols-2">
						<div>
							<label class="cs-label" for="client">Shipper client</label><select
								id="client"
								class="cs-input"
								bind:value={clientId}
								><option value="">Select a workspace member</option
								>{#each shippers as shipper (shipper.userId)}<option value={shipper.userId}
										>{shipper.displayName} · {shipper.email}</option
									>{/each}</select
							>
						</div>
						<div>
							<label class="cs-label" for="reference">External shipment reference</label><input
								id="reference"
								class="cs-input"
								bind:value={reference}
								placeholder="Customer or booking reference"
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
							<label class="cs-label" for="mode">Mode</label><select
								id="mode"
								class="cs-input"
								bind:value={mode}
								><option value="ocean">Ocean freight</option><option value="air">Air freight</option
								><option value="road">Road freight</option></select
							>
						</div>
						<div>
							<label class="cs-label" for="cargo">Cargo type</label><input
								id="cargo"
								class="cs-input"
								bind:value={cargoDescription}
								placeholder="Furniture and household goods"
							/>
						</div>
						<div>
							<label class="cs-label" for="departure">Estimated departure</label><input
								id="departure"
								type="date"
								class="cs-input"
								bind:value={estimatedDeparture}
							/>
						</div>
						<div>
							<label class="cs-label" for="arrival">Estimated arrival</label><input
								id="arrival"
								type="date"
								class="cs-input"
								bind:value={estimatedArrival}
							/>
						</div>
						<div class="md:col-span-2">
							<label class="cs-label" for="notes">Commercial notes</label><textarea
								id="notes"
								class="cs-input h-28"
								bind:value={notes}
								placeholder="Customer requirements, references, or operational context"></textarea>
						</div>
					</div>
				{:else if step === 2}
					<h2 class="text-xl font-extrabold">Assign partners</h2>
					<p class="cs-muted mt-1 text-sm">
						Milestones are created with the shipment. Partner assignments can be added after
						creation.
					</p>
					<div class="mt-7 space-y-3">
						<div class="cs-card-sm flex items-center gap-4 p-4">
							<span class="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"
								><Icon name="ship" /></span
							>
							<span class="flex-1"
								><b>Departure</b><small class="cs-muted block text-xs"
									>Shipment milestone · Pending</small
								></span
							>
						</div>
						<div class="cs-card-sm flex items-center gap-4 p-4">
							<span
								class="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-700"
								><Icon name="building" /></span
							>
							<span class="flex-1"
								><b>Final delivery</b><small class="cs-muted block text-xs"
									>Evidence required · Pending</small
								></span
							>
						</div>
					</div>
					<a class="mt-5 inline-flex font-bold text-teal-700" href="/forwarder-partner-directory"
						>Browse partner network <Icon name="arrow-right" size={16} /></a
					>
				{:else}
					<h2 class="text-xl font-extrabold">Review and create</h2>
					<p class="cs-muted mt-1 text-sm">
						Confirm the shipment record before creating it in the active workspace.
					</p>
					<div class="mt-7 grid gap-4 md:grid-cols-3">
						<div class="rounded-xl bg-slate-50 p-4">
							<p class="cs-muted text-xs">External reference</p>
							<p class="mt-1 font-extrabold">{reference || 'Generated by CargoSettle'}</p>
						</div>
						<div class="rounded-xl bg-slate-50 p-4">
							<p class="cs-muted text-xs">Route</p>
							<p class="mt-1 font-extrabold">{origin} -> {destination}</p>
						</div>
						<div class="rounded-xl bg-slate-50 p-4">
							<p class="cs-muted text-xs">Funding setup</p>
							<p class="mt-1 font-extrabold">After creation</p>
						</div>
					</div>
					{#if saved}
						<div class="mt-5 rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
							<b>Shipment {reference || 'record'} created.</b>
							<p class="mt-1">
								The record and its milestones are now stored in the active workspace.
							</p>
							{#if createdShipmentId}<a
									class="mt-3 inline-flex font-bold text-teal-800 underline"
									href={`/forwarder-shipment-detail?id=${createdShipmentId}`}
									>Open shipment detail</a
								>{/if}
						</div>
					{/if}
				{/if}
				{#if error}<div class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-900">
						{error}
					</div>{/if}
				<div class="cs-divider mt-8 flex justify-between border-t pt-5">
					<button
						class="cs-btn cs-btn-secondary"
						disabled={step === 1 || submitting}
						onclick={() => (step -= 1)}>Back</button
					>
					<div class="flex gap-2">
						<button
							class="cs-btn cs-btn-secondary"
							disabled={submitting || saved}
							onclick={submitShipment}>{submitting ? 'Saving...' : 'Save draft'}</button
						><button
							class="cs-btn cs-btn-primary"
							disabled={submitting || (step === 3 && saved)}
							onclick={continueStep}
							>{submitting
								? 'Creating...'
								: step === 3
									? saved
										? 'Created'
										: 'Create shipment'
									: 'Continue'}
							<Icon name="arrow-right" size={16} /></button
						>
					</div>
				</div>
			</div>
		</div>
	</section>
</AppShell>
