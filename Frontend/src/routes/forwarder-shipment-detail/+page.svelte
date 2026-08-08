<script lang="ts">
	import { page } from '$app/state';
	import AppShell from '$lib/components/AppShell.svelte';
	import DemoModal from '$lib/components/DemoModal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import OnchainShipmentSetup from '$lib/components/OnchainShipmentSetup.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import {
		addDocumentMetadata,
		formatDate,
		formatFundedAmount,
		getShipment,
		getWorkspaceMembers,
		milestoneStatusLabel,
		milestoneStatusTone,
		shipmentStatusLabel,
		shipmentStatusTone,
		updateMilestone,
		type ShipmentDetail,
		type WorkspaceMember
	} from '$lib/shipments';

	type SelectedFile = { name: string; type: string; size: number };

	let tab = $state('Overview');
	let modal = $state<'upload' | 'message' | 'bill' | 'customs' | 'fx' | null>(null);
	let shipment = $state<ShipmentDetail | null>(null);
	let members = $state<WorkspaceMember[]>([]);
	let documentName = $state('');
	let selectedFile = $state<SelectedFile | null>(null);
	let documentUploaded = $state(false);
	let partnerDraft = $state('');
	let partnerMessageSent = $state(false);
	let fxAmount = $state('8500');
	let fxQuoted = $state(false);
	let fxApplied = $state(false);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let tabs = ['Overview', 'Obligations', 'Documents', 'Audit trail'];
	let shipmentId = $derived(page.url.searchParams.get('id') ?? '');
	let route = $derived(
		shipment ? `${shipment.origin} -> ${shipment.destination}` : 'Shipment detail'
	);
	let nextMilestone = $derived(
		shipment?.milestones.find(
			(milestone) => !['completed', 'skipped'].includes(milestone.status)
		) ?? null
	);
	let milestoneProgress = $derived(
		shipment?.milestones.length
			? Math.round(
					(shipment.milestones.filter((milestone) =>
						['completed', 'skipped'].includes(milestone.status)
					).length /
						shipment.milestones.length) *
						100
				)
			: 0
	);

	$effect(() => {
		if (!shipmentId) {
			loading = false;
			error = 'Select a shipment from the shipment list to view its details.';
			return;
		}
		void loadShipment(shipmentId);
	});

	async function loadShipment(id: string) {
		loading = true;
		error = '';
		try {
			const result = await getShipment(id);
			shipment = result.shipment;
			if (page.data.activeWorkspace?.id) {
				try {
					members = (await getWorkspaceMembers(page.data.activeWorkspace.id)).members;
				} catch {
					members = [];
				}
			}
		} catch (requestError) {
			error = requestError instanceof Error ? requestError.message : 'Unable to load shipment';
		} finally {
			loading = false;
		}
	}

	function memberName(userId: string) {
		return members.find((member) => member.userId === userId)?.displayName ?? 'Workspace member';
	}

	async function verifyMilestone() {
		if (!shipment || !nextMilestone) return;
		saving = true;
		error = '';
		try {
			const result = await updateMilestone(shipment.id, nextMilestone.id, 'completed');
			shipment = {
				...shipment,
				milestones: shipment.milestones.map((milestone) =>
					milestone.id === result.milestone.id
						? {
								...milestone,
								status: result.milestone.status,
								completedAt: result.milestone.completedAt
							}
						: milestone
				)
			};
		} catch (requestError) {
			error = requestError instanceof Error ? requestError.message : 'Unable to update milestone';
		} finally {
			saving = false;
		}
	}

	async function confirmModal() {
		if (modal === 'upload') {
			if (!shipment || !selectedFile) {
				error = 'Choose a document before attaching it.';
				return;
			}
			saving = true;
			try {
				await addDocumentMetadata(shipment.id, {
					fileName: selectedFile.name,
					storageKey: `shipment/${shipment.id}/${selectedFile.name}`,
					mimeType: selectedFile.type || 'application/octet-stream',
					byteSize: selectedFile.size,
					milestoneId: nextMilestone?.id ?? null
				});
				documentUploaded = true;
				modal = null;
			} catch (requestError) {
				error =
					requestError instanceof Error
						? requestError.message
						: 'Unable to attach document metadata';
			} finally {
				saving = false;
			}
		} else if (modal === 'message') {
			partnerMessageSent = partnerDraft.trim().length > 0;
			if (partnerMessageSent) modal = null;
		} else if (modal === 'fx') {
			if (fxQuoted) fxApplied = true;
			else fxQuoted = true;
			if (fxApplied) modal = null;
		}
	}
</script>

<AppShell
	title={shipment ? `Shipment ${shipment.reference}` : 'Shipment detail'}
	subtitle={route}
	active="shipments"
>
	<section class="mx-auto max-w-[1600px] p-5 lg:p-8">
		{#if error}<div class="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-900">{error}</div>{/if}
		{#if loading}
			<div class="cs-card cs-muted p-8 text-center">Loading shipment...</div>
		{:else if shipment}
			<div class="cs-card p-5">
				<div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
					<div>
						<div class="flex items-center gap-3">
							<span class="cs-muted text-xs font-bold tracking-wider uppercase"
								>{shipment.reference}</span
							><StatusBadge
								label={shipmentStatusLabel(shipment.status)}
								tone={shipmentStatusTone(shipment.status)}
							/>
						</div>
						<h2 class="mt-2 text-2xl font-extrabold">{route}</h2>
						<p class="cs-muted mt-2 text-sm">
							{memberName(shipment.shipperId)} · {shipment.mode} · Estimated arrival {formatDate(
								shipment.estimatedArrival
							)}
						</p>
					</div>
					<div class="flex flex-wrap gap-2">
						<button
							class="cs-btn cs-btn-secondary"
							disabled={saving}
							onclick={() => (modal = 'upload')}
							><Icon name="upload" size={16} />Upload document</button
						><button class="cs-btn cs-btn-secondary" onclick={() => (modal = 'message')}
							><Icon name="message" size={16} />Message partners</button
						><button
							class="cs-btn cs-btn-primary"
							disabled={!nextMilestone || saving}
							onclick={verifyMilestone}
							><Icon name="check-circle" size={16} />{nextMilestone
								? 'Complete next milestone'
								: 'Milestones complete'}</button
						>
					</div>
				</div>
				<div class="mt-7 flex items-center gap-3">
					<div>
						<p class="text-sm font-bold">{shipment.origin}</p>
						<p class="cs-muted text-xs">{formatDate(shipment.estimatedDeparture)}</p>
					</div>
					<div class="cs-route-line flex-1"></div>
					<Icon name="ship" size={28} className="text-teal-700" />
					<div class="cs-route-line flex-1"></div>
					<div class="text-right">
						<p class="text-sm font-bold">{shipment.destination}</p>
						<p class="cs-muted text-xs">{formatDate(shipment.estimatedArrival)}</p>
					</div>
				</div>
			</div>
			<OnchainShipmentSetup shipmentId={shipment.id} />
			{#if documentUploaded || partnerMessageSent || fxApplied}<div
					class="mt-4 grid gap-3 md:grid-cols-3"
				>
					{#if documentUploaded}<div class="rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
							<b>Document metadata attached</b>
							<p class="mt-1">{documentName}</p>
						</div>{/if}
					{#if partnerMessageSent}<div class="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
							<b>Partner message prepared</b>
							<p class="mt-1">The message is ready for the operations workflow.</p>
						</div>{/if}
					{#if fxApplied}<div class="rounded-xl bg-purple-50 p-4 text-sm text-purple-900">
							<b>FX review completed</b>
							<p class="mt-1">EURC {fxAmount} was reviewed locally.</p>
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
						{#if tab === 'Overview'}
							<div class="p-5">
								<div class="grid gap-3 md:grid-cols-4">
									<div class="rounded-xl bg-slate-50 p-4">
										<p class="cs-muted text-xs">Shipment funded</p>
										<p class="mt-2 text-xl font-extrabold">
											{formatFundedAmount(shipment.fundedAmount, shipment.fundedCurrency)}
										</p>
									</div>
									<div class="rounded-xl bg-slate-50 p-4">
										<p class="cs-muted text-xs">Milestones complete</p>
										<p class="mt-2 text-xl font-extrabold">{milestoneProgress}%</p>
									</div>
									<div class="rounded-xl bg-slate-50 p-4">
										<p class="cs-muted text-xs">Mode</p>
										<p class="mt-2 text-xl font-extrabold capitalize">{shipment.mode}</p>
									</div>
									<div class="rounded-xl bg-slate-50 p-4">
										<p class="cs-muted text-xs">Created</p>
										<p class="mt-2 text-xl font-extrabold">{formatDate(shipment.createdAt)}</p>
									</div>
								</div>
								<h3 class="mt-7 font-extrabold">Shipment milestones</h3>
								<div class="mt-4 space-y-1">
									{#each shipment.milestones as milestone, index (milestone.id)}<div
											class="flex gap-4"
										>
											<div class="flex flex-col items-center">
												<span
													class={`grid h-8 w-8 place-items-center rounded-full ${milestone.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
													><Icon
														name={milestone.status === 'completed' ? 'check' : 'clock'}
														size={16}
													/></span
												>
												{#if index < shipment.milestones.length - 1}<span
														class="h-16 w-px bg-slate-200"
													></span>{/if}
											</div>
											<div class="pb-5">
												<div class="flex items-center gap-2">
													<p class="font-bold">{milestone.label}</p>
													<StatusBadge
														label={milestoneStatusLabel(milestone.status)}
														tone={milestoneStatusTone(milestone.status)}
													/>
												</div>
												<p class="cs-muted mt-1 text-sm">
													Due {formatDate(milestone.dueAt)}{milestone.completedAt
														? ` · Completed ${formatDate(milestone.completedAt)}`
														: ''}
												</p>
											</div>
										</div>{/each}
								</div>
							</div>
						{:else if tab === 'Obligations'}
							<div class="p-5">
								<div class="rounded-xl bg-slate-50 p-5 text-sm">
									<p class="font-bold">No obligation records are attached to this shipment yet.</p>
									<p class="cs-muted mt-1">
										Create an obligation after assigning a logistics partner and milestone.
									</p>
								</div>
							</div>
						{:else if tab === 'Documents'}
							<div class="space-y-3 p-5">
								{#if documentUploaded}<div class="cs-card-sm flex items-center gap-3 p-4">
										<Icon name="file" className="text-teal-700" />
										<div>
											<p class="text-sm font-bold">{documentName}</p>
											<p class="cs-muted text-xs">Metadata attached to this shipment</p>
										</div>
									</div>{:else}<div class="rounded-xl bg-slate-50 p-5 text-sm">
										<p class="font-bold">No documents attached.</p>
										<p class="cs-muted mt-1">
											Use Upload document to attach milestone evidence metadata.
										</p>
									</div>{/if}
							</div>
						{:else}
							<div class="space-y-4 p-5 text-sm">
								<p>
									<b>Shipment created</b> · {formatDate(shipment.createdAt)} · {memberName(
										shipment.shipperId
									)} created the commercial record.
								</p>
								<p><b>Current status</b> · {shipmentStatusLabel(shipment.status)}.</p>
								<p><b>Milestone progress</b> · {milestoneProgress}% complete.</p>
							</div>
						{/if}
					</div>
					<div class="cs-card p-5">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="font-extrabold">Participants</h3>
								<p class="cs-muted mt-1 text-xs">People and partners attached to this shipment</p>
							</div>
							<a
								href={`/forwarder-obligation-create?shipmentId=${shipment.id}`}
								class="cs-btn cs-btn-secondary"><Icon name="plus" size={16} />Add obligation</a
							>
						</div>
						<div class="cs-divider mt-4 divide-y">
							<div class="flex items-center gap-3 py-4">
								<div
									class="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xs font-bold"
								>
									SH
								</div>
								<div>
									<p class="font-bold">{memberName(shipment.shipperId)}</p>
									<p class="cs-muted text-xs">Shipper</p>
								</div>
							</div>
							{#each shipment.participants as participant (participant.id)}<div
									class="flex items-center gap-3 py-4"
								>
									<div
										class="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-800"
									>
										LP
									</div>
									<div>
										<p class="font-bold">{participant.name}</p>
										<p class="cs-muted text-xs">{participant.serviceType}</p>
									</div>
								</div>{/each}
						</div>
					</div>
				</div>
				<div class="space-y-5">
					<div class="cs-card p-5">
						<h3 class="font-extrabold">Shipment readiness</h3>
						<div class="mt-5 flex items-center gap-4">
							<div
								class="h-16 w-16 rounded-full border-[9px] border-teal-600 border-b-slate-200"
							></div>
							<div>
								<p class="text-3xl font-extrabold">{milestoneProgress}%</p>
								<p class="cs-muted text-xs">milestones complete</p>
							</div>
						</div>
						<div class="mt-5 space-y-3 text-sm">
							<div class="flex justify-between">
								<span class="cs-muted">Current status</span><b
									>{shipmentStatusLabel(shipment.status)}</b
								>
							</div>
							<div class="flex justify-between">
								<span class="cs-muted">Next milestone</span><b
									>{nextMilestone?.label ?? 'Complete'}</b
								>
							</div>
							<div class="flex justify-between">
								<span class="cs-muted">Funding</span><b
									>{formatFundedAmount(shipment.fundedAmount, shipment.fundedCurrency)}</b
								>
							</div>
						</div>
						<button
							class="cs-btn cs-btn-primary mt-5 w-full"
							disabled={!nextMilestone || saving}
							onclick={verifyMilestone}
							>{nextMilestone ? 'Complete next milestone' : 'All milestones complete'}</button
						>
					</div>
					<div class="cs-card p-5">
						<h3 class="font-extrabold">Shipment notes</h3>
						<p class="cs-muted mt-4 text-sm">
							{shipment.notes || 'No commercial notes were added.'}
						</p>
					</div>
				</div>
			</div>
		{:else}
			<div class="cs-card p-8 text-center">
				<p class="font-bold">Shipment unavailable</p>
				<a class="mt-3 inline-flex font-bold text-teal-700" href="/forwarder-shipments"
					>Back to shipments</a
				>
			</div>
		{/if}
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
		? 'Attach evidence metadata to the shipment record.'
		: modal === 'message'
			? 'Prepare an operational update for shipment participants.'
			: modal === 'fx'
				? 'Review the local quote before reserving EURC.'
				: 'Review the document attached to this shipment.'}
	confirmLabel={modal === 'upload'
		? 'Attach document'
		: modal === 'message'
			? 'Prepare message'
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
			onchange={(event) => {
				const file = event.currentTarget.files?.[0];
				if (file) {
					selectedFile = { name: file.name, type: file.type, size: file.size };
					documentName = file.name;
				}
			}}
		/>
		<p class="cs-muted mt-3 text-xs">
			The selected file is represented by metadata until storage upload is configured.
		</p>
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
			<p class="cs-muted text-xs font-bold tracking-wider uppercase">Bill of lading preview</p>
			<p class="mt-4 font-extrabold">No document metadata is attached yet.</p>
		</div>
	{:else if modal === 'customs'}
		<div class="rounded-xl bg-slate-50 p-5">
			<p class="cs-muted text-xs font-bold tracking-wider uppercase">Customs release preview</p>
			<p class="mt-4 font-extrabold">No document metadata is attached yet.</p>
		</div>
	{/if}
</DemoModal>
