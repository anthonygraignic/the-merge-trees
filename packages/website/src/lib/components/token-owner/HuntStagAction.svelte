<script lang="ts">
	import { type TheMergeTree } from '$lib/contracts';
	import ButtonWithLoading from '../ButtonWithLoading.svelte';

	export let tokenId: bigint;
	export let mergeTreesContract: TheMergeTree;
	export let error;

	// export let cooperationThreshold: boolean;

	let huntStagLoadingText = '';
	async function onHuntStag() {
		try {
			huntStagLoadingText = 'Confirming tx...';
			error = '';
			await mergeTreesContract.huntStag(tokenId);
		} catch (err) {
			console.error(err);
			error = `Failed to hunt stag for tree #${tokenId}`;
		}
		huntStagLoadingText = '';
	}
</script>

<ButtonWithLoading
	text="Hunt Stag 🦌"
	loadingText={huntStagLoadingText}
	onClick={onHuntStag}
	disabled={mergeTreesContract === undefined || !tokenId}
/>
