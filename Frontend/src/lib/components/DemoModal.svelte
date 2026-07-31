<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		open = false,
		title,
		description = '',
		confirmLabel = 'Save',
		showConfirm = true,
		onClose = () => {},
		onConfirm = () => {},
		children
	} = $props<{
		open?: boolean;
		title: string;
		description?: string;
		confirmLabel?: string;
		showConfirm?: boolean;
		onClose?: () => void;
		onConfirm?: () => void;
		children?: Snippet;
	}>();
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 grid place-items-center bg-[#102a36]/45 p-4"
		role="presentation"
		onclick={onClose}
	>
		<div
			class="cs-card cs-shadow max-h-[90vh] w-full max-w-xl overflow-y-auto"
			role="dialog"
			aria-modal="true"
			aria-labelledby="demo-modal-title"
			tabindex="-1"
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => event.stopPropagation()}
		>
			<div class="cs-divider flex items-start justify-between gap-4 border-b p-5">
				<div>
					<h2 id="demo-modal-title" class="text-xl font-extrabold">{title}</h2>
					{#if description}<p class="cs-muted mt-1 text-sm">{description}</p>{/if}
				</div>
				<button
					class="cs-muted rounded-lg p-2 hover:bg-slate-50"
					aria-label="Close dialog"
					onclick={onClose}><Icon name="x" size={18} /></button
				>
			</div>
			<div class="p-5">{@render children?.()}</div>
			<div class="cs-divider flex justify-end gap-2 border-t bg-slate-50 p-4">
				<button class="cs-btn cs-btn-secondary" onclick={onClose}>Close</button
				>{#if showConfirm}<button class="cs-btn cs-btn-primary" onclick={onConfirm}
						>{confirmLabel}</button
					>{/if}
			</div>
		</div>
	</div>
{/if}
