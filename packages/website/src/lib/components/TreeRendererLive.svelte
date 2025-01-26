<script>
	import { onMount } from 'svelte';
	import BranchsRendererLive from './BranchsRendererLive.svelte';

	export let showSave = false;
	export let id = 'tree-0';
	export let length = 200;
	export let diameter = 10;
	const MAX_LENGTH = 227;
	const MIN_LENGTH = 20;
	export let simulateGrowth = true;
	export let grow = true;
	export let animated = false;
	export let showMarker = true;
	export let showMarkerDistorsion = false;
	export let improvedMarkerRendering = false;
	export let markerDimension = 1;

	$: mw = improvedMarkerRendering ? Math.pow(Math.pow(N, 1 / delta), segments - 1) : 1;
	$: mh = improvedMarkerRendering ? Math.pow(Math.pow(N, 1 / D), segments - 1) : 1;

	/**
	 * @type {number}
	 */
	export let markerSelector;

	export let segments = 4;
	export let angle = 20;

	export let N = 2;

	// 2.2 < D < 2.8
	export let D = 2.6;
	// 1.8 < delta < 2.3
	export let delta = 2.2;

	/**
	 * @type {number}
	 */
	export let width = 0;
	// /**
	//  * @type {number}
	//  */
	// export let height = 0;

	function handleMousemove(event) {
		// console.log(`handleMousemove ${event.clientX}/${width}, ${event.clientY}/${height}`);
		// if (event.clientY && height) {
		// 	length = (MAX_LENGTH * (height - event.clientY)) / height;
		// }
		console.info(mw, mh);
	}
	function handleClick(event) {
		if (event.clientX < width / 2) {
			if (segments > 0) {
				segments -= 1;
			}
		} else {
			// limit number of nodes to 129
			if (Math.pow(N, segments) < 129) {
				segments += 1;
			}
		}
	}

	/**
	 * @type {string | number | NodeJS.Timeout | undefined}
	 */
	let growCallback = undefined;
	$: {
		if (simulateGrowth) {
			if (growCallback) {
				clearInterval(growCallback);
			}
			growCallback = setInterval(growTree, 80);
		}
	}
	function growTree() {
		if (simulateGrowth) {
			if (grow) {
				if (length < MAX_LENGTH) {
					length += 1;
				} else if (length === MAX_LENGTH) {
					grow = false;
				}
			} else {
				if (length > MIN_LENGTH) {
					length -= 1;
				} else if (length === MIN_LENGTH) {
					grow = true;
				}
			}
		}
	}

	onMount(() => {
		if (simulateGrowth) {
			growCallback = setInterval(growTree, 80);
		}
	});

	let svg;
	function save(
		name = `tree_b${N}_s${segments}_l${length}_d${diameter}_a${angle}_D${D}_delta${delta}.svg`
	) {
		svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		var svgData = svg.outerHTML;
		var preface = '<?xml version="1.0" standalone="no"?>\r\n';
		var svgBlob = new Blob([preface, svgData], { type: 'image/svg+xml;charset=utf-8' });
		var svgUrl = URL.createObjectURL(svgBlob);
		var downloadLink = document.createElement('a');
		downloadLink.href = svgUrl;
		downloadLink.download = name;
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}
</script>

<div class="flex flex-col items-center">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div {id} on:mousemove={handleMousemove} on:click={handleClick} on:keypress={handleClick}>
		<svg
			bind:this={svg}
			width="1024"
			height="1024"
			viewBox="0 0 1024 1024"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Merge Tree</title>
			<defs>
				{#if showMarker}
					<!-- viewbox from tree max -->
					<marker
						id="{id}dot"
						orient="auto"
						markerUnits="userSpaceOnUse"
						refX="50%"
						refY="50%"
						viewBox="{0} {0} {1024 * mw} {1024 * mh}"
						markerWidth={markerDimension}
						markerHeight={markerDimension}
						preserveAspectRatio="none"
					>
						{#if showMarkerDistorsion}
							<rect width="100%" height="100%" style="fill: yellow; opacity: 70%;" />
						{/if}
						<!-- 1.{cut number} -->
						<!-- {@html marker} -->
						{#if markerSelector === 1}
							<svg viewBox="0 0 10 10">
								<path d="M 0 0 L 10 5 L 0 10 z" />
							</svg>
						{:else if markerSelector === 2}
							<svg viewBox="0 0 100 100">
								<circle cx="50" cy="50" r="40" stroke="red" stroke-width="3" fill="transparent" />
							</svg>
						{:else if markerSelector === 3}
							<!-- CC0 from https://www.svgrepo.com/svg/9954/flower -->
							<svg
								version="1.1"
								id="Capa_1"
								xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink"
								x="0px"
								y="0px"
								viewBox="0 0 488.934 488.934"
								style="enable-background:new 0 0 488.934 488.934;"
								xml:space="preserve"
							>
								<g>
									<g>
										<g>
											<g>
												<path
													d="M245.017,488.8c-53-3.7-68.7-49.9-74.9-61.4c-56.1,22.4-85.3,4.2-100.9-13.5c-12.5-15.6-24.2-41.3-5.2-92.6
									c-57.7-30.3-63.5-55.1-63.5-77s11.7-52.5,62.4-74.9c-19.4-50-7.2-78.9,5.3-93.5c15.6-17.7,41.6-36,100.9-13.5
									c24.7-53.7,54.1-62.4,75.9-62.4s51.3,9.4,74.9,62.4c56.9-22.6,85.3-4.2,100.9,13.5c12.5,15.6,24.4,39.8,5.2,92.6
									c54.2,24.9,62.4,54.1,62.4,74.9c0,21.8-7.9,50-62.4,74.9c19.5,52.4,7.3,78-5.2,92.6c-34.6,41.4-80.8,18.1-100.9,13.5
									C295.717,478.2,266.817,490.4,245.017,488.8z M198.217,393.1c7.3,15.6,23.9,54,46.8,55.1c22.6,1.1,39.5-39.5,46.8-55.1
									c4.2-9.4,15.4-12.9,25-10.4c23.5,6,58.2,23,72.8,3.1c14.9-13.5-0.9-49.2-6.2-69.7c-2.5-9.5,1-20.8,10.4-25
									c37-19.2,55.2-28.6,55.1-46.8c0-20.5-12.4-21.5-55.1-46.8c-9.4-4.2-13.5-15.6-10.4-25c5.2-15.6,21.1-55.7,6.2-69.7
									c-15.6-18-57.2-2.1-72.8,3.1c-9.4,3.1-20.8-1-25-10.4c-25.8-56.8-38.6-52.9-46.8-54.1c-19.3-2.7-39.5,38.5-46.8,54.1
									c-4.2,9.4-15.6,13.5-25,10.4c-15.6-5.2-61-23.7-72.8-3.1c-14.2,11.2,2.1,54.1,7.3,69.7c3.1,9.4-1,20.8-10.4,25
									c-16.6,7.3-56.3,26.1-56.2,46.8c0.1,17.2,19.5,27.5,55.1,46.8c9.4,4.2,13.5,15.6,10.4,25c-5.2,15.6-20.4,56.7-7.3,69.7
									c13.8,19.5,57.1,1.8,72.8-3.1C184.317,378.9,192.617,381.7,198.217,393.1z"
												/>
											</g>
											<g>
												<path
													d="M245.017,381.7c-14.6,0-31.4-6.5-43.7-30.2c-24.8,10.2-44.7,0-55.1-12.5c-8.3-10.4-15.2-23.7-6.2-49.9
									c-21.6-10.1-30.2-29.1-30.2-43.7s8.2-33.2,30.2-43.7c-8.3-21.2-2.1-39.5,6.2-49.9c10.4-12.5,31-22.1,55.1-12.5
									c12-23.3,29.1-30.2,43.7-30.2c14.6,0,33.6,8.4,43.7,30.2c28.6-9.4,44.7,0,55.1,12.5c8.3,10.4,15.8,22.4,6.2,49.9
									c22.6,11.1,30.2,29.1,30.2,43.7s-6.1,31.3-30.2,43.7c7.6,25.6,2.1,39.5-6.2,49.9c-8.3,10.4-26.3,21.2-55.1,11.4
									C279.717,372.2,259.617,381.7,245.017,381.7z M210.717,306.8c7.3,0,14.6,4.2,18.7,11.4c3.1,7.3,8.3,14.6,12.5,21.8
									c2.1,3.1,4.2,3.1,6.2,0c5.2-6.2,9.4-13.5,12.5-21.8c4.2-9.4,15.6-13.5,25-10.4c8.3,3.1,15.6,5.2,23.9,6.2
									c4.2-0.1,4.2-3.1,4.2-4.2c-1-8.3-3.1-16.6-6.2-23.9c-3.1-9.4,1-20.8,10.4-25c7.3-3.1,14.6-8.3,21.8-12.5c3.3-2.2,2.1-5.2,0-6.2
									c-6.2-5.2-13.5-9.4-21.8-12.5c-9.4-4.2-13.5-15.6-10.4-25c3.1-8.3,5.2-15.6,6.2-23.9c0.2-3-2.1-4.2-4.2-4.2
									c-9.4,1-16.6,3.1-25,6.2c-9.4,3.1-20.8-1-25-10.4c-3.1-7.3-8.3-14.6-12.5-21.8c-2.1-3.1-4.2-3.1-6.2,0
									c-5.2,7.3-9.4,13.5-12.5,21.8c-4.2,9.4-15.6,13.5-25,10.4c-8.3-3.1-15.6-5.2-23.9-6.2c-2.1-0.1-4.4,1.3-4.2,4.2
									c1,8.3,3.1,16.6,6.2,23.9c3.1,9.4-1,20.8-10.4,25c-7.3,3.1-14.6,8.3-21.8,12.5c-2.9,2.1-2.7,5,0,6.2c7.3,5.2,13.5,9.4,21.8,12.5
									c9.4,4.2,13.5,15.6,10.4,25c-3.1,8.3-5.2,15.6-6.2,23.9c-0.2,3.2,2.1,4.2,4.2,4.2c9.4-1,16.6-3.1,25-6.2
									C206.517,306.8,208.617,306.8,210.717,306.8z"
												/>
											</g>
										</g>
									</g>
								</g>
								<g />
								<g />
								<g />
								<g />
								<g />
								<g />
								<g />
								<g />
								<g />
								<g />
								<g />
								<g />
								<g />
								<g />
								<g />
							</svg>
						{:else}
							<svg viewBox="0 0 2 2">
								<circle cx="1" cy="1" r="1" fill="#0B6623" />
							</svg>
						{/if}
					</marker>
				{/if}

				<g id="{id}stem"
					><line
						x1="0"
						y1="0"
						x2="0"
						y2="-1"
						stroke="black"
						stroke-width={diameter / length}
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-dasharray="1"
						stroke-dashoffset="0"
					>
						<!-- <animate
							attributeName="stroke-dasharray"
							dur="5s"
							values="0;0.1;0.3;0.5;0.8;0.9;1"
							repeatCount="indefinite"
							
						/> -->
						{#if animated}
							{#if grow}
								<!-- GROW -->
								<animate
									attributeName="stroke-dashoffset"
									dur="12s"
									repeatCount="indefinite"
									values="1;0.1;0.07;0.05;0"
								/>
							{:else}
								<!-- DECLINE -->
								<animate
									attributeName="stroke-dashoffset"
									dur="12s"
									repeatCount="indefinite"
									values="0;0.05;0.07;0.1;1"
								/>
							{/if}
						{/if}
						<!-- Move animation to branch, and chain them (using begin="circ-anim.begin + 1s")
							But need to remove groups as animation don't work on them :/
						-->
					</line></g
				>
				{#each { length: segments } as _, i}
					<BranchsRendererLive {id} k={i + 1} {angle} {N} {D} {delta} marker={showMarker} />
				{/each}
				<BranchsRendererLive {id} k={0} {angle} {N} {D} {delta} marker={showMarker} />
				{#if animated}
					{#if grow}
						<!-- GROW -->
						<animate
							xlink:href="#{id}dot"
							attributeType="CSS"
							attributeName="opacity"
							values="0;0.9;1"
							dur="12s"
							repeatCount="indefinite"
						/>
					{:else}
						<!-- DECLINE -->
						<animate
							xlink:href="#{id}dot"
							attributeType="CSS"
							attributeName="opacity"
							values="1;0.9;0"
							dur="12s"
							repeatCount="indefinite"
						/>
					{/if}
				{/if}
			</defs>
			<defs
				><linearGradient id="{id}-sky" gradientTransform="rotate(90)">
					{#if grow}
						<stop stop-color="#bae6fd" />
						<stop offset="66%" stop-color="#f0f9ff" />
					{:else}
						<stop stop-color="#fff7ed" />
						<stop offset="66%" stop-color="#fed7aa" />
					{/if}
				</linearGradient></defs
			><rect width="1024" height="1024" fill="url(#{id}-sky)" />

			<g transform="translate(512, 1000) scale({length})"><use href="#{id}l{segments - 1}" /></g>
			{#if grow}
				<rect width="1024" height="24" y="1000" fill="#2e8b57" />
			{:else}
				<rect width="1024" height="24" y="1000" fill="#660000" />
			{/if}
		</svg>
	</div>
	{#if showSave}
		<button
			type="button"
			class="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800
			font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-2 mb-2"
			on:click={() => {
				save();
			}}>Save image</button
		>
	{/if}
</div>

<style lang="postcss">
	svg {
		width: 100%;
		height: 100%;
	}
</style>
