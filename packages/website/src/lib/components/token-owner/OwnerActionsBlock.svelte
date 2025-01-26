<script lang="ts">
	import { mergeTrees, type TheMergeTree } from '$lib/contracts';
	import { networkReadiness } from '$lib/blockchain/NetworkReader';
	import { connectedAccount, provider } from '$lib/wallet';
	import { ethers } from 'ethers';
	import { onMount } from 'svelte';
	import ButtonWithLoading from '../ButtonWithLoading.svelte';
	import ClaimAction from './ClaimAction.svelte';
	import HuntHareAction from './HuntHareAction.svelte';
	import HuntStagAction from './HuntStagAction.svelte';

	let loading = false;
	export let error: string;

	export let tokenId: bigint;
	export let tokenOwner: string;
	let toggleColor: boolean = false;
	let colorPickerSelector: bigint;

	let hasStagHuntStarted: boolean;
	let degrowthUntilBlockForTokenId: bigint;

	export let mergeTreesContract: TheMergeTree;

	let isAColorSelector = false;
	let minHuntHarePrice = 0n;

	let claimMaxQuantity = 0n;

	onMount(async () => {
		if (mergeTreesContract) {
			colorPickerSelector = await mergeTreesContract.COLOR_PICKER_SELECTOR();
			isAColorSelector = tokenId % colorPickerSelector === 0n;

			toggleColor =
				((await mergeTreesContract.colors()) & (1n << (tokenId / colorPickerSelector))) !== 0n;

			hasStagHuntStarted = await mergeTreesContract.hasStagHuntStarted();
			degrowthUntilBlockForTokenId = await mergeTreesContract.tokenIdsDeclineUntil(tokenId);

			minHuntHarePrice =
				(await mergeTreesContract.trees(tokenId)).hares *
				(await mergeTreesContract.HARE_KILL_PRICE()) *
				(await mergeTreesContract.totalSupply());

			claimMaxQuantity = await mergeTreesContract.pendingClaims($connectedAccount);
		} else {
			console.error('mergeTreesContract is not defined');
		}
	});

	async function onToggleColor() {
		try {
			error = '';
			const tx = await mergeTreesContract.toggleColor(tokenId);
			console.log(tx);
			toggleColor = !toggleColor;
		} catch (err) {
			console.error(err);
			error = {
				message: `Failed to toggle color for tree #${tokenId}`
			};
		}
	}

	let burnLoadingText = '';
	async function onBurn() {
		try {
			burnLoadingText = 'Confirming tx...';
			error = '';
			await mergeTreesContract.burn(tokenId);
		} catch (err) {
			console.error(err);
			error = {
				message: `Failed to burn tree #${tokenId}`
			};
		}
		burnLoadingText = '';
	}

	let transferLoadingText = '';
	async function onTransfer() {
		try {
			transferLoadingText = 'Confirming tx...';
			error = '';
			await mergeTreesContract.transferFrom(
				$connectedAccount,
				$connectedAccount.startsWith('0x7099')
					? '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'
					: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
				tokenId
			);
		} catch (err) {
			console.error(err);
			error = {
				message: `Failed to transfer tree #${tokenId}`
			};
		}
		transferLoadingText = '';
	}

	let setMarketLoadingText = '';
	async function onSetMarker() {
		try {
			setMarketLoadingText = 'Confirming tx...';
			error = '';
			// await mergeTreesContract.setMarker(tokenId);
		} catch (err) {
			console.error(err);
			error = {
				message: `Failed to set marker for tree #${tokenId}`
			};
		}
		setMarketLoadingText = '';
	}
</script>

{#if $connectedAccount && tokenOwner && mergeTreesContract}
	{#if $connectedAccount.toLowerCase() === tokenOwner.toLowerCase()}
		<div class="mt-4 mb-16">
			<h2>Owner Actions</h2>
			<div class="grid grid-flow-row items-center gap-2 justify-items-end">
				{#if isAColorSelector}
					<label for="default-toggle" class="inline-flex relative items-center mb-4 cursor-pointer">
						<input
							type="checkbox"
							value=""
							id="default-toggle"
							class="sr-only peer"
							bind:checked={toggleColor}
							on:click|preventDefault={onToggleColor}
						/>
						<div
							class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"
						/>
						<span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
							>Toggle color bit</span
						>
					</label>
				{/if}

				{#if import.meta.env.MODE === 'development'}
					<ButtonWithLoading
						text="Transfer"
						loadingText={transferLoadingText}
						onClick={onTransfer}
					/>
				{/if}

				<ButtonWithLoading text="Burn" loadingText={burnLoadingText} onClick={onBurn} />

				<h3>Hunt game</h3>

				{#if hasStagHuntStarted}
					<p class="text-sm text-gray-500 dark:text-gray-400">
						Stag hunt has started. You can now hunt the stag or a hare for this tree.
					</p>
					<ClaimAction {mergeTreesContract} {claimMaxQuantity} bind:error />

					<div>
						<HuntHareAction {mergeTreesContract} {tokenId} bind:error {minHuntHarePrice} />
					</div>

					<HuntStagAction {mergeTreesContract} {tokenId} bind:error />
				{:else}
					<p class="text-sm text-gray-500 dark:text-gray-400">
						Stag hunt has not started yet.<br />Ask your friends to mint all the initial supply.
					</p>
				{/if}

				<h3>Marker</h3>

				<div class="flex flex-row w-full">
					<label for="markers" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Select an approved marker</label
					>
					<select
						id="markers"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					>
						<option selected>Default</option>
						<option value="0x...">...</option>
					</select>
				</div>
				<ButtonWithLoading
					text="Set Marker"
					loadingText={setMarketLoadingText}
					onClick={onSetMarker}
					disabled={true}
				/>
			</div>
		</div>
	{/if}
{/if}
