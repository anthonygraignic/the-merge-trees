<script lang="ts">
	import { type TheMergeTree } from '$lib/contracts';
	import { ethers } from 'ethers';
	import ButtonWithLoading from '../ButtonWithLoading.svelte';

	export let tokenId: number;
	export let mergeTreesContract: TheMergeTree;
	export let error;
	export let minHuntHarePrice = 0n;

	let huntHareLoadingText = '';
	let huntHareAmount: number;
	async function onHuntHare() {
		const value = ethers.parseEther(huntHareAmount.toString());
		// js trick to check if huntHareAmount is defined and not 0
		if (!(huntHareAmount > -1) || value < minHuntHarePrice) {
			error = `Hunt hare amount should be greater than or equal to ${minHuntHarePrice}`;
			return;
		}
		try {
			huntHareLoadingText = 'Confirming tx...';
			error = '';
			await mergeTreesContract.huntHare(tokenId, {
				value
			});
		} catch (err) {
			console.error(err);
			error = `Failed to hunt hare for tree #${tokenId}`;
		}
		huntHareLoadingText = '';
	}
</script>

<div class="flex flex-row w-full">
	<label for="hunt-hare" class="sr-only block text-sm font-medium text-gray-900 dark:text-gray-300"
		>Hunt Hare Amount</label
	>
	<input
		type="number"
		id="hunt-hare"
		min={minHuntHarePrice ? ethers.formatEther(minHuntHarePrice) : 0}
		step="0.01"
		class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
		placeholder="Ξ {minHuntHarePrice ? ethers.formatEther(minHuntHarePrice) : 0} or more"
		bind:value={huntHareAmount}
	/>

	<ButtonWithLoading
		text="Hunt hare 🐰"
		loadingText={huntHareLoadingText}
		onClick={onHuntHare}
		disabled={mergeTreesContract === undefined || !(tokenId > -1) || !(huntHareAmount > -1)}
	/>
</div>
