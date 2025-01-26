<script>
	import TreeRendererLive from '$lib/components/TreeRendererLive.svelte';
	import { onMount } from 'svelte';
	import SvelteSeo from 'svelte-seo';

	let length = import.meta.env.DEV ? 227 : 200;
	let diameter = 10;
	let D = import.meta.env.DEV ? 2.8 : 2.2;
	let delta = 2.2;
	let grow = true;
	let simulateGrowth = false;
	let showMarker = true;

	let treesTestSet = [
		{ angle: 20, N: 2 },
		{ angle: 20, N: 3 },
		{ angle: 20, N: 4 },
		{ angle: 30, N: 2 },
		{ angle: 30, N: 3 },
		{ angle: 30, N: 4 },
		{ angle: 45, N: 2 },
		{ angle: 45, N: 3 },
		{ angle: 45, N: 4 },
		{ angle: 60, N: 2 },
		{ angle: 60, N: 3 },
		{ angle: 60, N: 4 },
		{ angle: 90, N: 2 },
		{ angle: 90, N: 3 },
		{ angle: 90, N: 4 }
	];

	function setRandomParams() {
		diameter = 100 * Math.random();
		length = 227 * Math.random();
	}
	function saveAll() {
		for (let tree of treesTestSet) {
			// save(tree.svg, `tree_b${tree.N}_l${length}_d${diameter}_a${tree.angle}.svg`);
		}
	}
	function update() {
		treesTestSet = [...treesTestSet];
	}
	onMount(() => {
		alert('Developer page for QA purposes only, your browser might crash before this alert...');
		simulateGrowth = false;
		// right way to update array for svelte update
		// numbers = [...numbers, numbers.length + 1];
	});
</script>

<SvelteSeo title="QA" description="For test purposes only" />

<main class="pt-20">
	<div class="flex sm:flex-row flex-col items-center justify-items-center space-x-2">
		<div>
			<label
				for="trunkLength"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Trunk length:</label
			>
			<input
				type="number"
				id="trunkLength"
				name="trunkLength"
				min="0"
				bind:value={length}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			/>
		</div>
		<div>
			<label for="diameter" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>Trunk diameter:</label
			>
			<input
				type="number"
				id="diameter"
				name="diameter"
				min="0"
				max="40"
				bind:value={diameter}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			/>
		</div>

		<div>
			<label for="diameter" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>D:</label
			>
			<input
				type="number"
				id="D"
				name="D"
				min="2.2"
				max="2.8"
				step=".1"
				bind:value={D}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			/>
		</div>

		<div>
			<label for="delta" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>delta:</label
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
		</div>
		<div>
			<label for="animateGrow" class="relative inline-flex items-center my-4 cursor-pointer">
				<input
					type="checkbox"
					id="animateGrow"
					class="sr-only peer"
					bind:checked={simulateGrowth}
				/>
				<div
					class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
				/>
				<span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
					>Simulate Growth?</span
				>
			</label>
		</div>
		<div>
			<label for="marker" class="relative inline-flex items-center my-4 cursor-pointer">
				<input type="checkbox" id="marker" class="sr-only peer" bind:checked={showMarker} />
				<div
					class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
				/>
				<span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Marker?</span>
			</label>
		</div>

		<div>
			<label for="grow" class="relative inline-flex items-center my-4 cursor-pointer">
				<input type="checkbox" id="grow" class="sr-only peer" bind:checked={grow} />
				<div
					class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
				/>
				<span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Grow?</span>
			</label>
		</div>

		<button
			type="button"
			class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
			on:click={setRandomParams}
			>Random
		</button>

		<!-- <button
			type="button"
			class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
			on:click={update}
			>Update
		</button> -->
		<!-- <button
			type="button"
			disabled
			class="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800
			font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-8 mb-2"
			on:click={saveAll}>Save image</button
		> -->
	</div>
	<div class="grid lg:grid-cols-6 sm:grid-cols-3 grid-cols-1 gap-4 mt-2">
		{#each treesTestSet as tree, index}
			<div id="tree-{index}" class="border-green-300 border-opacity-30 border-dashed border">
				<TreeRendererLive
					id="tree-{index}"
					{simulateGrowth}
					bind:length
					bind:diameter
					angle={tree.angle}
					N={tree.N}
					bind:D
					bind:delta
					{showMarker}
					improvedMarkerRendering={false}
					markerSelector={0}
					segments={6}
					bind:grow
				/>
				<p class="text-center">{tree.angle}°, {tree.N}b</p>
			</div>
		{/each}
	</div>
</main>
