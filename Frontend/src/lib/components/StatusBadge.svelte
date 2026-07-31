<script lang="ts">
	let { label, tone = 'neutral' } = $props<{ label: string; tone?: string }>();
</script>

<span class={`cs-status cs-status-${tone}`}>{label}</span>
