<script lang="ts">
	let {
		name = 'circle',
		size = 18,
		strokeWidth = 2,
		className = ''
	} = $props<{
		name?: string;
		size?: number;
		strokeWidth?: number;
		className?: string;
	}>();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	aria-hidden="true"
>
	{#if name === 'route'}
		<circle cx="6" cy="19" r="3" /><path d="M9 19h2a4 4 0 0 0 4-4V9a4 4 0 0 1 4-4h0" /><circle
			cx="19"
			cy="5"
			r="3"
		/>
	{:else if name === 'arrow-right'}
		<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
	{:else if name === 'arrow-up-right'}
		<path d="M7 17 17 7" /><path d="M7 7h10v10" />
	{:else if name === 'arrow-left'}
		<path d="M19 12H5" /><path d="m11 18-6-6 6-6" />
	{:else if name === 'plus'}
		<path d="M12 5v14" /><path d="M5 12h14" />
	{:else if name === 'search'}
		<circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
	{:else if name === 'bell'}
		<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" />
	{:else if name === 'menu'}
		<path d="M4 6h16M4 12h16M4 18h16" />
	{:else if name === 'x'}
		<path d="m6 6 12 12M18 6 6 18" />
	{:else if name === 'chevron-right'}
		<path d="m9 18 6-6-6-6" />
	{:else if name === 'chevron-down'}
		<path d="m6 9 6 6 6-6" />
	{:else if name === 'chevrons-up-down'}
		<path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
	{:else if name === 'layout-dashboard'}
		<rect x="3" y="3" width="7" height="7" rx="1" /><rect
			x="14"
			y="3"
			width="7"
			height="7"
			rx="1"
		/><rect x="3" y="14" width="7" height="7" rx="1" /><rect
			x="14"
			y="14"
			width="7"
			height="7"
			rx="1"
		/>
	{:else if name === 'container'}
		<path d="M3 7h18v10H3z" /><path d="M7 7V4h10v3M7 17v3m10-3v3" />
	{:else if name === 'inbox'}
		<path d="M4 4h16v16H4z" /><path d="M4 13h4l2 3h4l2-3h4" />
	{:else if name === 'building'}
		<path d="M3 21h18M5 21V5h9v16M14 9h5v12M8 8h3m-3 4h3m-3 4h3" />
	{:else if name === 'landmark'}
		<path d="m3 10 9-6 9 6M5 10v8m4-8v8m6-8v8m4-8v8M3 21h18M2 18h20" />
	{:else if name === 'receipt'}
		<path d="M5 3h14v18l-3-2-4 2-4-2-3 2z" /><path d="M8 8h8M8 12h8M8 16h4" />
	{:else if name === 'bar-chart'}
		<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
	{:else if name === 'settings'}
		<circle cx="12" cy="12" r="3" /><path
			d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v2.6h-.1a1.7 1.7 0 0 0-1.5 1z"
		/>
	{:else if name === 'more'}
		<circle cx="5" cy="12" r="1" fill="currentColor" /><circle
			cx="12"
			cy="12"
			r="1"
			fill="currentColor"
		/><circle cx="19" cy="12" r="1" fill="currentColor" />
	{:else if name === 'filter'}
		<path d="M4 6h16M7 12h10m-7 6h4" />
	{:else if name === 'check'}
		<path d="m5 12 4 4L19 6" />
	{:else if name === 'check-circle'}
		<circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" />
	{:else if name === 'alert'}
		<path d="m12 3 9 18H3z" /><path d="M12 9v4m0 4h.01" />
	{:else if name === 'ship'}
		<path d="M3 17h18l-3 3H6zM5 17l2-7h10l2 7M9 10V5h6v5M12 5V3" />
	{:else if name === 'truck'}
		<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle
			cx="18"
			cy="18"
			r="2"
		/>
	{:else if name === 'clock'}
		<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
	{:else if name === 'wallet'}
		<path d="M4 6h16v13H4z" /><path d="M4 6V4h13v2m-2 7h5" /><circle
			cx="17"
			cy="13"
			r=".5"
			fill="currentColor"
		/>
	{:else if name === 'dollar'}
		<circle cx="12" cy="12" r="9" /><path
			d="M12 6v12m3-9.5c-.7-.7-1.7-1-3-1-1.7 0-3 1-3 2.3 0 3.4 6 1.7 6 5.1 0 1.4-1.3 2.6-3 2.6-1.3 0-2.3-.3-3-1"
		/>
	{:else if name === 'file'}
		<path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6m-6 4h6" />
	{:else if name === 'upload'}
		<path d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14" />
	{:else if name === 'download'}
		<path d="M12 4v12m0 0 5-5m-5 5-5-5M5 20h14" />
	{:else if name === 'message'}
		<path d="M4 5h16v11H8l-4 4z" /><path d="M8 9h8m-8 3h5" />
	{:else if name === 'info'}
		<circle cx="12" cy="12" r="9" /><path d="M12 10v6m0-9h.01" />
	{:else if name === 'zap'}
		<path d="m13 2-9 12h7l-1 8 9-12h-7z" />
	{:else}
		<circle cx="12" cy="12" r="9" />
	{/if}
</svg>
