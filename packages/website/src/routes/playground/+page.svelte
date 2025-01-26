<script>
	import SvelteSeo from 'svelte-seo';
	import TreeRendererLive from '$lib/components/TreeRendererLive.svelte';
	import { onMount } from 'svelte';

	let segments = 3;
	let angle = 20;
	let diameter = 10;
	let length = 200;
	let branches = 2;

	let D = 2.8;
	let delta = 2.2;

	let animated = false;
	let grow = true;
	let simulateGrowth = false;
	let showMarker = true;
	let showMarkerDistorsion = false;
	let markerSelector = 0;

	let render2;

	let renderingTime2 = 0;

	onMount(() =>
		alert(
			'Welcome to the Merge Tree Playground, please be careful while adjusting the settings as it can be very CPU INTENSIVE.'
		)
	);

	function submit() {
		render2();
	}

	function renderDone2(event) {
		renderingTime2 = event.detail;
	}

	$: nodesNumber = Math.pow(branches, segments);
</script>

<SvelteSeo title="Playground" description="For test purposes only" />

<main class="px-4 pt-20 grid grid-flow-col grid-cols-3 justify-items-center">
	<div>
		<form
			id="tree-form"
			class="flex flex-col justify-items-center"
			on:submit|preventDefault={submit}
		>
			<label for="segments" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>Segments:</label
			>
			<input
				type="number"
				id="segments"
				name="segments"
				min="1"
				max="6"
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
				bind:value={diameter}
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
				max="227"
				bind:value={length}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			/>
			<label for="branches" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>Number of branches:</label
			>
			<input
				type="number"
				id="branches"
				name="branches"
				min="2"
				max="4"
				step="1"
				bind:value={branches}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			/>
			<label for="d" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>Fractal dimension (Hausdorff), D:</label
			>
			<input
				type="number"
				id="d"
				name="d"
				min="2.2"
				max="2.8"
				step=".1"
				bind:value={D}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			/>

			<label for="d" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>Leonardo exponent, (delta):</label
			>
			<input
				type="number"
				id="delta"
				name="delta"
				min="1.8"
				max="2.3"
				step=".1"
				bind:value={delta}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			/>

			<label for="simulate-growth" class="relative inline-flex items-center my-4 cursor-pointer">
				<input
					type="checkbox"
					id="simulate-growth"
					class="sr-only peer"
					bind:checked={simulateGrowth}
				/>
				<div
					class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
				/>
				<span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
					>Simulate growth & decline</span
				>
			</label>

			<label for="grow" class="relative inline-flex items-center my-4 cursor-pointer">
				<input type="checkbox" id="grow" class="sr-only peer" bind:checked={grow} />
				<div
					class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
				/>
				<span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Grow?</span>
			</label>

			<label for="animated" class="relative inline-flex items-center my-4 cursor-pointer">
				<input type="checkbox" id="animated" class="sr-only peer" bind:checked={animated} />
				<div
					class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
				/>
				<span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Animated?</span>
			</label>

			<label for="marker" class="relative inline-flex items-center my-4 cursor-pointer">
				<input type="checkbox" id="marker" class="sr-only peer" bind:checked={showMarker} />
				<div
					class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
				/>
				<span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
					>Marker (for composition)?</span
				>
			</label>
			<label for="markerdistorsion" class="relative inline-flex items-center my-4 cursor-pointer">
				<input
					type="checkbox"
					id="markerdistorsion"
					class="sr-only peer"
					bind:checked={showMarkerDistorsion}
				/>
				<div
					class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
				/>
				<span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
					>Marker distorsion?</span
				>
			</label>
			<label
				for="marker-content"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
				>Marker content</label
			>
			<select
				id="marker-content"
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
				bind:value={markerSelector}
			>
				<option value={0}>Default green leaf</option>
				<option value={1}>Triangle</option>
				<option value={2}>Circle with red border</option>
				<option value={3}>Flower</option>
			</select>

			<button
				type="submit"
				class="mt-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
				>Refresh</button
			>
		</form>

		<div>
			<p>
				<em>Calculations</em>
			</p>
			<!-- <span>{text}</span> -->
			<p>
				Nodes (B^R)= {branches}^{segments} =
				<span class:nodes-too-complex={nodesNumber > 4096}>{nodesNumber}</span>
			</p>
			<p>Rendering timing: {renderingTime2}ms</p>
		</div>
	</div>
	<TreeRendererLive
		bind:segments
		bind:length
		bind:angle
		bind:N={branches}
		bind:simulateGrowth
		bind:D
		bind:diameter
		bind:delta
		improvedMarkerRendering={true}
		{animated}
		{showMarker}
		{showMarkerDistorsion}
		{markerSelector}
		bind:grow
	/>
</main>

<style lang="postcss">
	.nodes-too-complex {
		@apply text-red-500 animate-pulse;
	}
</style>
