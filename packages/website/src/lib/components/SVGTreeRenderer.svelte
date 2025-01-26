<script>
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	let loading = false;

	export let svg;
	export let width = 1024;
	export let height = 1024;

	const D = 2.2;

	export let initLength = 0;
	export let initDiameter = 0;
	export let segments = 0;
	export let branchAngle = 20;
	export let numberOfBranches = 2;

	const dispatch = createEventDispatcher();
	export const render = () => {
		loading = true;
		treePaths = '';
		const startTime = Date.now();
		drawTree(0, 512, initLength, initDiameter, segments - 1, 360);
		const endTime = Date.now();
		dispatch('renderDone', endTime - startTime);
		// console.log(`render1 done: ${endTime - startTime}ms`);
		loading = false;
	};

	let treePaths = '<path d="M0,512L213,512" stroke="saddlebrown" stroke-width="20" />';

	const deg_to_rad = Math.PI / 180.0;

	function drawLine(x1, y1, x2, y2, diameter) {
		treePaths += `<path d="M${x1},${y1}L${x2},${y2}" stroke="saddlebrown" stroke-width="${diameter}" />`;
	}

	function drawTree(x1, y1, lengthk, diameterk, depth, angle) {
		if (depth !== 0) {
			var x2 = x1 + Math.cos(angle * deg_to_rad) * lengthk;
			var y2 = y1 + Math.sin(angle * deg_to_rad) * lengthk;
			drawLine(x1, y1, x2, y2, diameterk);

			const level = segments - depth;
			const lengthk1 = lengthk / Math.pow(level, 1 / D);
			const diameterk1 = diameterk / Math.pow(level, 1 / D);

			// console.log(`Drawing tree ${level}, ${lengthk1}, ${diameterk1}`);

			drawTree(x2, y2, lengthk1, diameterk1, depth - 1, angle - branchAngle);
			drawTree(x2, y2, lengthk1, diameterk1, depth - 1, angle + branchAngle);
			if (numberOfBranches === 3) {
				drawTree(x2, y2, lengthk1, diameterk1, depth - 1, angle);
			}
		}
	}
</script>

{#if loading}
	<div class="flex items-center justify-items-centers h-full">
		<svg
			role="status"
			class="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-green-500"
			viewBox="0 0 100 101"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
				fill="currentColor"
			/>
			<path
				d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
				fill="currentFill"
			/>
		</svg>
	</div>
{:else}
	<div class="border border-emerald-200 border-dashed">
		<svg width="100%" height="auto" bind:this={svg} viewBox="0 0 {width} {height}">
			<defs
				><marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5"
					><circle cx="5" cy="5" r="5" fill="#0B6623" /></marker
				></defs
			>
			<g transform="rotate(-90,512,512) translate(24,0)">
				{@html treePaths}
			</g>
			<rect width="1024" height="24" y="1000" style="fill:#2e8b57" />
		</svg>
	</div>
{/if}
