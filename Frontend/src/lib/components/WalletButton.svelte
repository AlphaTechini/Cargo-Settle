<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ARC_TESTNET_CHAIN_ID_HEX,
		connectArcWallet,
		disconnectArcWallet,
		getLinkedWallet,
		getWalletClient,
		getWalletSnapshot,
		linkConnectedWallet,
		subscribeWallet
	} from '$lib/chain';
	import type { Address, Hex } from 'viem';

	let address = $state<Address | null>(getWalletSnapshot().address);
	let chainId = $state<Hex | null>(getWalletSnapshot().chainId);
	let linkedAddress = $state<Address | null>(null);
	let menuOpen = $state(false);
	let loading = $state(false);
	let error = $state('');

	onMount(() => {
		const unsubscribe = subscribeWallet((next) => {
			address = next.address;
			chainId = next.chainId;
			if (!next.address || next.address.toLowerCase() !== linkedAddress?.toLowerCase())
				linkedAddress = null;
		});
		void restoreWallet();
		return () => unsubscribe();
	});

	async function restoreWallet() {
		try {
			const client = await getWalletClient();
			const restoredAddress = client.getAccount();
			const restoredChainId = client.getChainId();
			if (restoredAddress) {
				address = restoredAddress;
				chainId = restoredChainId ?? null;
				linkedAddress = await getLinkedWallet();
			}
		} catch {
			// Wallet setup remains lazy until the user opens the connection flow.
		}
	}

	async function connectAndLink() {
		loading = true;
		error = '';
		try {
			const result = await connectArcWallet();
			address = result.address;
			chainId = result.chainId;
			linkedAddress = await linkConnectedWallet(result.address, result.chainId);
			menuOpen = true;
		} catch (requestError) {
			error = requestError instanceof Error ? requestError.message : 'Unable to connect wallet';
		} finally {
			loading = false;
		}
	}

	async function disconnect() {
		await disconnectArcWallet();
		menuOpen = false;
		address = null;
		chainId = null;
		linkedAddress = null;
	}

	function shortAddress(value: string) {
		return `${value.slice(0, 6)}...${value.slice(-4)}`;
	}
</script>

<div class="relative">
	{#if address}
		<button
			class="cs-btn cs-btn-secondary !px-3"
			aria-expanded={menuOpen}
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span
				class={`h-2 w-2 rounded-full ${chainId === ARC_TESTNET_CHAIN_ID_HEX ? 'bg-emerald-500' : 'bg-amber-500'}`}
			></span>
			<span>{shortAddress(address)}</span>
		</button>
	{:else}
		<button class="cs-btn cs-btn-secondary !px-3" disabled={loading} onclick={connectAndLink}>
			{loading ? 'Connecting...' : 'Connect wallet'}
		</button>
	{/if}
	{#if menuOpen && address}
		<div class="cs-card cs-shadow absolute top-full right-0 z-40 mt-2 w-72 p-4 text-sm">
			<p class="font-extrabold">Connected wallet</p>
			<p class="cs-muted mt-1 text-xs break-all">{address}</p>
			<div class="cs-divider mt-4 border-t pt-3">
				<div class="flex justify-between gap-3">
					<span class="cs-muted">Network</span><b
						>{chainId === ARC_TESTNET_CHAIN_ID_HEX ? 'Arc Testnet' : 'Switch required'}</b
					>
				</div>
				<div class="mt-2 flex justify-between gap-3">
					<span class="cs-muted">Ownership</span><b
						class={linkedAddress ? 'text-emerald-700' : 'text-amber-700'}
						>{linkedAddress ? 'Verified' : 'Not linked'}</b
					>
				</div>
			</div>
			{#if !linkedAddress}<button
					class="cs-btn cs-btn-primary mt-4 w-full"
					disabled={loading}
					onclick={connectAndLink}>{loading ? 'Signing...' : 'Verify wallet ownership'}</button
				>{/if}
			<button class="cs-btn cs-btn-secondary mt-2 w-full" onclick={disconnect}>Disconnect</button>
		</div>
	{/if}
	{#if error}<p
			class="absolute top-full right-0 z-40 mt-2 w-72 rounded-lg bg-red-50 p-2 text-xs text-red-900"
			role="alert"
		>
			{error}
		</p>{/if}
</div>
