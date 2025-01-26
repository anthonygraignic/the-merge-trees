<script>
	import TreeRendererLive from '$lib/components/TreeRendererLive.svelte';
	import SvelteSeo from 'svelte-seo';

	let D = import.meta.env.DEV ? 2.8 : 2.2;
	let delta = 2.2;

	let treesTestSet = [
		// { grow: true, angle: 20, N: 2, length: 20, segments: 1, diameter: 30 },
		// { grow: true, angle: 20, N: 2, length: 50, segments: 2, diameter: 30 },
		{ grow: true, angle: 20, N: 2, length: 75, segments: 2, diameter: 25 },
		// { grow: true, angle: 20, N: 2, length: 100, segments: 2, diameter: 30 },
		{ grow: true, angle: 20, N: 2, length: 150, segments: 4, diameter: 25 },
		// { grow: true, angle: 20, N: 2, length: 200, segments: 2, diameter: 30 },
		{ grow: true, angle: 20, N: 2, length: 227, segments: 6, diameter: 25 },
		{ grow: false, angle: 20, N: 2, length: 227, segments: 5, diameter: 25 },
		{ grow: false, angle: 20, N: 2, length: 150, segments: 4, diameter: 25 },
		{ grow: false, angle: 20, N: 1, length: 50, segments: 2, diameter: 25 }
	];
</script>

<SvelteSeo title="QA" description="For test purposes only" />

<main class="pt-20">
	<section class="my-4">
		<div class="grid lg:grid-cols-6 sm:grid-cols-3 grid-cols-1 gap-0 mt-2">
			{#each treesTestSet as tree, index}
				<div id="tree-{index}">
					<TreeRendererLive
						id="tree-{index}"
						simulateGrowth={false}
						length={tree.length}
						diameter={tree.diameter}
						angle={tree.angle}
						N={tree.N}
						bind:D
						bind:delta
						showMarker={true}
						markerSelector={0}
						segments={tree.segments}
						grow={tree.grow}
						showSave={false}
					/>
				</div>
			{/each}
		</div>
	</section>
</main>
