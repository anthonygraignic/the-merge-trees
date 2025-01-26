<script lang="ts">
	import { type TheMergeTree } from '$lib/contracts';
	import ButtonWithLoading from '../ButtonWithLoading.svelte';

	export let mergeTreesContract: TheMergeTree;
	export let claimMaxQuantity: bigint;
	export let error;

	let claimLoadingText = '';
	let claimQuantity: number;
	async function onClaim() {
		try {
			claimLoadingText = 'Confirming tx...';
			error = '';
			await mergeTreesContract.claim(claimQuantity);
		} catch (err) {
			console.error(err);
			error = `Failed to claim`;
		}
		claimLoadingText = '';
	}
</script>

{#if claimMaxQuantity > 0}
	<div class="flex flex-row w-full">
		<label
			for="claim-quantity"
			class="sr-only block text-sm font-medium text-gray-900 dark:text-gray-300">Claim</label
		>
		<input
			type="number"
			id="claim-quantity"
			min={1}
			max={claimMaxQuantity.toString()}
			step="1"
			class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			placeholder="1 to {claimMaxQuantity}"
			bind:value={claimQuantity}
		/>
		<ButtonWithLoading
			text="Claim"
			loadingText={claimLoadingText}
			onClick={onClaim}
			disabled={mergeTreesContract === undefined}
		/>
	</div>
{:else}
	<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">You have no pending claims.</p>
{/if}
