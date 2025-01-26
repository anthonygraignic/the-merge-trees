<script>
	import SvelteSeo from 'svelte-seo';
	import SvgTreeRenderer from '$lib/components/SVGTreeRenderer.svelte';
	import SvgTreeRendererUseLinks from '$lib/components/SVGTreeRendererUseLinks.svelte';

	let segments = 5;
	let angle = 20;
	let trunkDiameter = 10;
	let trunkLength = 200;
	let numberOfBranches = 2;

	let grow = true;
	let marker = false;
	let blockMiningSpeed = 0;

	let showRender1 = true;
	let showRender2 = true;
	let render;
	let render2;

	let computeText;
	let renderingTime = 0;
	let renderingTime2 = 0;

	function submit() {
		if (showRender1) {
			render();
		}
		if (showRender2) {
			render2();
		}
	}

	function renderDone(event) {
		renderingTime = event.detail;
	}
	function renderDone2(event) {
		renderingTime2 = event.detail;
	}

	$: {
		if (blockMiningSpeed > 0) {
			console.log('Triggered animation');
			setTimeout(() => {
				if (grow) {
					trunkLength += blockMiningSpeed;
				} else {
					trunkLength -= blockMiningSpeed;
				}
				submit();
			}, 1000);
		}
	}

	/**
	 * @type {any}
	 */
	let svg;
	/**
	 * @type {any}
	 */
	let svg2;

	// @ts-ignore
	function save(svg, name = 'download.svg') {
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

<SvelteSeo title="QA" description="For test purposes only" />

<main class="pt-20">
	<div>
		<form id="tree-form" class="tree-form" on:submit|preventDefault={submit}>
			<label for="segments" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>Segments:</label
			>
			<input
				type="number"
				id="segments"
				name="segments"
				min="1"
				max="20"
				bind:value={segments}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			/>
			<label for="angle" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>Angle:</label
			>
			<input
				type="number"
				id="angle"
				name="angle"
				bind:value={angle}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			/>
			<label
				for="trunkDiameter"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>Trunk diameter:</label
			>
			<input
				type="number"
				id="trunkDiameter"
				name="trunkDiameter"
				min="0"
				bind:value={trunkDiameter}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			/>
			<label
				for="trunkLength"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Trunk length:</label
			>
			<input
				type="number"
				id="trunkLength"
				name="trunkLength"
				min="0"
				bind:value={trunkLength}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			/>
			<label
				for="numberOfBranches"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>Number of branches:</label
			>
			<input
				type="number"
				id="numberOfBranches"
				name="numberOfBranches"
				min="2"
				max="3"
				step="1"
				bind:value={numberOfBranches}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			/>
			<label
				for="blockMiningSpeed"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
				>Select your block mining speed</label
			>
			<select
				id="blockMiningSpeed"
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
				bind:value={blockMiningSpeed}
			>
				<option value={0}>0</option>
				<option value={1}>1</option>
				<option value={10}>10</option>
				<option value={20}>20</option>
			</select>

			<label for="grow" class="relative inline-flex items-center my-4 cursor-pointer">
				<input type="checkbox" id="grow" class="sr-only peer" bind:checked={grow} />
				<div
					class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
				/>
				<span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Grow?</span>
			</label>

			<label for="marker" class="relative inline-flex items-center my-4 cursor-pointer">
				<input type="checkbox" id="marker" class="sr-only peer" bind:checked={marker} />
				<div
					class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
				/>
				<span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Marker?</span>
			</label>

			<fieldset>
				<legend class="sr-only">Show renders</legend>

				<div class="flex items-center mb-4">
					<input
						id="show-render-1"
						type="checkbox"
						bind:checked={showRender1}
						class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
					/>
					<label
						for="show-render-1"
						class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
					>
						Render 1 (paths)</label
					>
				</div>

				<div class="flex items-center mb-4">
					<input
						id="show-render-2"
						type="checkbox"
						bind:checked={showRender2}
						class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
					/>
					<label
						for="show-render-2"
						class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Render 2 (use)</label
					>
				</div>
			</fieldset>

			<button
				type="submit"
				class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
				>Refresh</button
			>
		</form>

		<div>
			<p>
				<em>Calculations</em>
			</p>
			<!-- <span>{text}</span> -->
			<p>
				Number of Nodes (B^R)= {numberOfBranches}^{segments} = {Math.pow(
					numberOfBranches,
					segments
				)}
			</p>
			<p>Rendering timing : {renderingTime}ms</p>
			<p>Rendering timing 2 : {renderingTime2}ms</p>
		</div>

		<div class="flex items-center justify-between">
			<button
				type="button"
				class="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800
			font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-8 mb-2"
				on:click={() =>
					save(
						svg,
						`tree_m1_b${numberOfBranches}_s${segments}_l${trunkLength}_d${trunkDiameter}_a${angle}.svg`
					)}>Save 1</button
			>

			<button
				type="button"
				class="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800
			 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-8 mb-2"
				on:click={() =>
					save(
						svg2,
						`tree_m2_b${numberOfBranches}_s${segments}_l${trunkLength}_d${trunkDiameter}_a${angle}.svg`
					)}>Save 2</button
			>
		</div>
	</div>

	{#if showRender1}
		<SvgTreeRenderer
			bind:svg
			bind:initDiameter={trunkDiameter}
			bind:initLength={trunkLength}
			bind:segments
			bind:branchAngle={angle}
			bind:numberOfBranches
			bind:render
			on:renderDone={renderDone}
		/>
	{/if}
	{#if showRender2}
		<SvgTreeRendererUseLinks
			bind:svg={svg2}
			bind:initDiameter={trunkDiameter}
			bind:initLength={trunkLength}
			bind:segments
			bind:branchAngle={angle}
			bind:numberOfBranches
			bind:render2
			on:render2Done={renderDone2}
			bind:marker
		/>
	{/if}
</main>

<style lang="postcss">
	main {
		@apply px-4;
		@apply grid grid-flow-col grid-cols-3;
		@apply justify-items-center;
	}

	.tree-form {
		@apply flex flex-col justify-items-center;
	}
</style>
