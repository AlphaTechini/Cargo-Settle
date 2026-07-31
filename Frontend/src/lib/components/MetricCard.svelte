<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		label,
		value,
		note,
		icon = 'dollar',
		tone = 'emerald'
	} = $props<{
		label: string;
		value: string;
		note: string;
		icon?: string;
		tone?: string;
	}>();

	const toneClasses: Record<string, string> = {
		emerald: 'bg-emerald-50 text-emerald-700',
		blue: 'bg-blue-50 text-blue-700',
		amber: 'bg-amber-50 text-amber-700',
		purple: 'bg-purple-50 text-purple-700'
	};
	let toneClass = $derived(toneClasses[tone] ?? toneClasses.emerald);
</script>

<div class="cs-card p-5">
	<div class="flex items-start justify-between gap-3">
		<div>
			<p class="cs-muted text-sm font-semibold">{label}</p>
			<p class="cs-kpi mt-2 text-[2rem] font-extrabold">{value}</p>
		</div>
		<span class={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}>
			<Icon name={icon} size={20} />
		</span>
	</div>
	<p class="cs-muted mt-3 text-xs">{note}</p>
</div>
