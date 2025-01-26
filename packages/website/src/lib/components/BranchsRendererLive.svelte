<script>
	export let id = '';
	export let marker = false;
	export let k = 1;
	export let N = 2;
	export let angle = 20;
	export let D = 2.2;
	export let delta = 2.2;

	$: scaleLength = Math.pow(N, -1 / D).toFixed(4);
	$: scaleDiameter = Math.pow(N, -1 / delta).toFixed(4);
	$: markerAttr = marker && k === 0 ? `url(#${id}dot)` : '';
</script>

<g id="{id}l{k}" marker-end={markerAttr}>
	{#if N === 2}
		<use
			href="#{id}l{k - 1}"
			transform="translate(0, -1) rotate(-{angle}) scale({scaleDiameter},{scaleLength})"
		/>
		<use
			href="#{id}l{k - 1}"
			transform="translate(0, -1) rotate(+{angle}) scale({scaleDiameter},{scaleLength})"
		/>
	{:else if N === 3}
		<use
			href="#{id}l{k - 1}"
			transform="translate(0, -1) rotate(-{angle}) scale({scaleDiameter},{scaleLength})"
		/>
		<use
			href="#{id}l{k - 1}"
			transform="translate(0, -1) rotate(+{angle}) scale({scaleDiameter},{scaleLength})"
		/>
		<use href="#{id}l{k - 1}" transform="translate(0, -1) scale({scaleDiameter},{scaleLength})" />
	{:else if N === 4}
		<use
			href="#{id}l{k - 1}"
			transform="translate(0, -1) rotate(-{(angle * 3) / 2}) scale({scaleDiameter},{scaleLength})"
		/>
		<use
			href="#{id}l{k - 1}"
			transform="translate(0, -1) rotate(-{angle / 2}) scale({scaleDiameter},{scaleLength})"
		/>
		<use
			href="#{id}l{k - 1}"
			transform="translate(0, -1) rotate(+{angle / 2}) scale({scaleDiameter},{scaleLength})"
		/>
		<use
			href="#{id}l{k - 1}"
			transform="translate(0, -1) rotate(+{(angle * 3) / 2}) scale({scaleDiameter},{scaleLength})"
		/>
	{/if}
	<use href="#{id}stem" />
</g>
