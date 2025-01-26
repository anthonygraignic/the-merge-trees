<script lang="ts">
	import { mergeTreesABI, type TheMergeTree } from '$lib/contracts';
	import mergeTreesArtifact from 'merge-trees-contracts/artifacts/contracts/TheMergeTree.sol/TheMergeTree.json';
	import ButtonWithLoading from '../ButtonWithLoading.svelte';
	import { connectedAccount, provider } from '$lib/wallet';
	import { PUBLIC_EXPLORER_URL, PUBLIC_MERGETREES_CONTRACT_ADDRESS } from '$env/static/public';
	import { ethers } from 'ethers';
	import { get } from 'svelte/store';
	import { browser } from '$app/environment';
	import { networkReadiness } from '$lib/blockchain/NetworkReader';
	import TxLink from '../TxLink.svelte';
	import CountDownTimerBlock from './CountDownTimerBlock.svelte';
	import ClaimAction from '../token-owner/ClaimAction.svelte';
	import HuntHareAction from '../token-owner/HuntHareAction.svelte';
	import HuntStagAction from '../token-owner/HuntStagAction.svelte';
	import MarketplaceLinkList from '../MarketplaceLinkList.svelte';

	let mergeTreesContract: TheMergeTree;

	export let error;

	let supply: bigint;
	let totalSupply: bigint;
	let totalPendingClaim: bigint;
	let mintPrice: bigint;
	let hasStagHuntStarted: boolean;
	let cooperation: bigint;
	$: cooperationPercentage = Number(cooperation) / 100;

	let mintedTokens: bigint[] = [];

	let claimMaxQuantity: bigint;

	let declineUntil: bigint;
	let blockNumber: bigint;
	$: estimateDateToDeclineEnd = new Date(
		Date.now() + (declineUntil > blockNumber ? Number(declineUntil - blockNumber) * 12 * 1000 : 0)
	);
	let txHash: string;

	let ownedTrees: bigint[] = [];
	let selectedTokenId: number;
	let hareKillPrice: bigint;
	let minHuntHarePrice: bigint;
	$: updateMinHuntHarePrice(selectedTokenId);

	async function updateMinHuntHarePrice(tokenId: number) {
		if (mergeTreesContract && tokenId) {
			const tree = await mergeTreesContract.trees(tokenId);
			minHuntHarePrice = (1n + tree.hares) * hareKillPrice * totalSupply;
		}
	}

	connectedAccount.subscribe(async (connectedAccount) => {
		if (connectedAccount) {
			await initContractWithSigner();
		} else {
			mergeTreesContract = undefined;
		}
	});

	if (browser) {
		networkReadiness.subscribe((readiness) => {
			if (readiness) {
				initContractWithSigner();
			}
		});
	}

	let mintLoadingText = '';
	async function onMint() {
		try {
			error = '';
			mintLoadingText = 'Confirming tx...';
			const tx = await mergeTreesContract.mint({ value: mintPrice });
			mintLoadingText = 'Executing tx...';
			txHash = tx.hash;
			const receipt = await tx.wait();
			console.warn(receipt);
			for (let i = 0; i < receipt.logs.length; i++) {
				const log = receipt.logs[i];
			}

			let mintedTokenId: bigint =
				receipt.logs
					?.filter((e) => e?.fragment?.name === 'MergeTreeCreated')
					.flatMap((e) => e?.args[0]) ?? [];

			mintedTokens = [mintedTokenId, ...mintedTokens];
			ownedTrees = [mintedTokenId, ...ownedTrees];
		} catch (err) {
			console.error(err);
			error = 'Failed to mint a tree';
		}
		mintLoadingText = '';
	}

	async function initContractWithSigner() {
		console.log('initContractWithSigner');
		try {
			mergeTreesContract = new ethers.Contract(
				PUBLIC_MERGETREES_CONTRACT_ADDRESS,
				mergeTreesArtifact.abi,
				await get(provider).getSigner()
			);
			hasStagHuntStarted = await mergeTreesContract.hasStagHuntStarted();
			totalSupply = await mergeTreesContract.totalSupply();

			if (hasStagHuntStarted) {
				await initContractWithSignerStagHunt();
				await initContractListenersStagHunt();
			} else {
				await initContractWithSignerOpenMint();
				await initContractListenersOpenMint();
			}

			await initContractGetTokensOfOwner();
		} catch (err) {
			console.error(err);
			error = 'Failed to load contract with signer wallet';
		}
	}

	async function initContractGetTokensOfOwner() {
		ownedTrees = [];
		let balance = await mergeTreesContract.balanceOf(get(connectedAccount));
		for (let i = 0; i < balance; i++) {
			ownedTrees = [
				await mergeTreesContract.tokenOfOwnerByIndex(get(connectedAccount), i),
				...ownedTrees
			];
		}
	}

	async function initContractWithSignerOpenMint() {
		supply = await mergeTreesContract.BEFORE_HUNT_SUPPLY();
		mintPrice = await mergeTreesContract.OPEN_MINT_PRICE();
	}

	async function initContractWithSignerStagHunt() {
		totalPendingClaim = await mergeTreesContract.totalPendingClaim();

		hareKillPrice = await mergeTreesContract.HARE_KILL_PRICE();
		cooperation = await mergeTreesContract.cooperation();

		declineUntil = await mergeTreesContract.declineUntil();
		blockNumber = BigInt(await get(provider).getBlockNumber());

		for (let i = 0; i < ownedTrees.length; i++) {
			let tokenId = ownedTrees[i];
			// let tree = await mergeTreesContract.trees(tokenId);
			// console.log(`Tree ${tokenId}: ${tree}`);
			mergeTreesContract.tokenIdsDeclineUntil(tokenId);
		}
		claimMaxQuantity = await mergeTreesContract.pendingClaims(get(connectedAccount));
	}

	async function initContractListenersOpenMint() {
		mergeTreesContract.on('MergeTreeCreated', async (from, to, amount, event) => {
			console.log(`MergeTreeCreated: ${from} => ${to}: ${amount}`);

			totalSupply = await mergeTreesContract.totalSupply();
			totalPendingClaim = await mergeTreesContract.totalPendingClaim();
			// Listen to stag hunt start if supply is close to the limit
			if (totalSupply > supply - 10n) {
				hasStagHuntStarted = await mergeTreesContract.hasStagHuntStarted();
				cooperation = await mergeTreesContract.cooperation();
			}
			if (hasStagHuntStarted && event) {
				await initContractGetTokensOfOwner();
				event.removeListener();
			}
		});
		mergeTreesContract.on('MergeTreeBurned', async (from, to, amount, event) => {
			console.log(`MergeTreeBurned: ${from} => ${to}: ${amount}`);

			totalSupply = await mergeTreesContract.totalSupply();
			totalPendingClaim = await mergeTreesContract.totalPendingClaim();
			cooperation = await mergeTreesContract.cooperation();
			await initContractGetTokensOfOwner();
			if (hasStagHuntStarted && event) {
				event.removeListener();
			}
		});
	}

	async function initContractListenersStagHunt() {
		mergeTreesContract.on('StagKilled', async (hunterTokenId, tokenIds, amount, event) => {
			console.log(`StagKilled: ${hunterTokenId}`);
			declineUntil = await mergeTreesContract.declineUntil();
			totalSupply = await mergeTreesContract.totalSupply();
			totalPendingClaim = await mergeTreesContract.totalPendingClaim();
			cooperation = await mergeTreesContract.cooperation();
		});
		mergeTreesContract.on('HareKilled', async (hunterTokenId, amount, event) => {
			console.log(`HareKilled: ${hunterTokenId}`);
			declineUntil = await mergeTreesContract.declineUntil();
			totalSupply = await mergeTreesContract.totalSupply();
			totalPendingClaim = await mergeTreesContract.totalPendingClaim();
			cooperation = await mergeTreesContract.cooperation();
			await initContractGetTokensOfOwner();
		});
	}
</script>

{#if hasStagHuntStarted}
	<div>
		<h1>Phase 2: Stag Hunt</h1>
		<p>The stag hunt has started.</p>

		<div class="my-2">
			{#if declineUntil > 0 && declineUntil > blockNumber}
				<h3>Status: 📉 Global decline</h3>
				<p>Until block <b>{declineUntil}</b></p>
				{#key estimateDateToDeclineEnd}
					{#if estimateDateToDeclineEnd}
						<time datetime={estimateDateToDeclineEnd?.toISOString()} class="flex items-center">
							<p>Estimated in&nbsp;</p>
							<CountDownTimerBlock
								dateTimeISO8601Str={estimateDateToDeclineEnd?.toISOString()}
								display={{ d: true, h: true, m: true, s: true }}
							/>
						</time>
					{/if}
				{/key}
			{:else}
				<h3>Status: 📈 Growth</h3>
			{/if}
			<a
				href="{PUBLIC_EXPLORER_URL}/address/{PUBLIC_MERGETREES_CONTRACT_ADDRESS}#events"
				rel="external noopener noreferrer"
				target="_blank"
				class="inline-flex items-center underline"
			>
				See latest events
				<img
					src="/images/icons/external-link.svg"
					alt="Link to transaction"
					class="dark:invert w-6"
				/>
				<span class="sr-only">Link to explorer</span>
			</a>
		</div>
		<h2 class="mt-4">Hunt stats</h2>
		<p>Total supply: <b>{totalSupply ?? 0}</b></p>
		<p>Total to claim: <b>{totalPendingClaim ?? 0}</b></p>
		<p>
			Cooperation: <b>{cooperationPercentage}%</b>
			{#if cooperationPercentage > 51}
				🧑‍🧑‍🧑
			{:else if cooperationPercentage >= 25 && cooperationPercentage < 51}
				🧑‍🧑🫥
			{:else if cooperationPercentage >= 7 && cooperationPercentage < 25}
				🧑🫥🫥
			{:else}
				🫥🫥🫥
			{/if}
		</p>

		<h2 class="mt-4">Your trees</h2>
		{#if ownedTrees.length > 0}
			{#each ownedTrees as tokenId}
				<a href={`/trees/${tokenId}`} class="underline">
					#{tokenId}
				</a>
				&nbsp;
			{/each}
		{/if}

		<!-- <h2>Color</h2> -->
		<!-- <p></p> -->
	</div>
	<div class="flex flex-col items-center justify-center">
		{#if ownedTrees.length > 0}
			<h3>
				Quick actions
				{#if selectedTokenId}
					for tree
					<a href={`/trees/${selectedTokenId}`} class="underline">
						#{selectedTokenId}
					</a>
				{/if}
			</h3>
			<div class="my-2 flex items-center justify-around w-full">
				<label for="token-id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Select your token id</label
				>
				{#key ownedTrees}
					<select
						id="token-id"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						bind:value={selectedTokenId}
					>
						{#each ownedTrees as tokenId}
							<option value={tokenId}>{tokenId}</option>
						{/each}
					</select>
				{/key}
			</div>

			<div class="grid items-center gap-2 justify-items-end">
				<HuntStagAction {mergeTreesContract} tokenId={selectedTokenId} bind:error />

				<HuntHareAction
					{mergeTreesContract}
					tokenId={selectedTokenId}
					{minHuntHarePrice}
					bind:error
				/>

				<ClaimAction {mergeTreesContract} {claimMaxQuantity} bind:error />
			</div>
		{:else}
			<p>You don't have any trees yet.</p>
			<p class="mt-4">Buy one:</p>
			<div class="flex items-center justify-start">
				<MarketplaceLinkList tokenId="" externalLink={true} />
			</div>
		{/if}
	</div>
{:else}
	<div>
		<h1>Phase 1: Open Mint</h1>
		<p>Supply: {totalSupply ?? 0} / {supply ?? 103}</p>

		<p>3 trees max per address</p>

		{#if ownedTrees.length > 0}
			<h2 class="mt-2">Your trees</h2>
			{#each ownedTrees as tokenId}
				<a href={`/trees/${tokenId}`} class="underline">
					#{tokenId}
				</a>
				&nbsp;
			{/each}
		{/if}
	</div>
	<div>
		{#if !mergeTreesContract}
			<p>Please connect your wallet</p>
		{/if}

		{#if (mintedTokens && mintedTokens.length > 2) || (ownedTrees && ownedTrees.length > 2)}
			<p>You already minted the maximum number of trees.</p>
		{:else}
			<ButtonWithLoading
				onClick={onMint}
				loadingText={mintLoadingText}
				text="Mint {mintPrice ? '1 for ' + ethers.formatEther(mintPrice) + ' ETH' : ''}"
				bind:error
				disabled={mergeTreesContract === undefined}
			/>
		{/if}
		<div>
			{#if txHash}
				Transaction hash:
				<TxLink {txHash} />
			{/if}

			{#if mintedTokens && mintedTokens.length > 0}
				<div>
					<p>
						Minted tokens:
						{#each mintedTokens as tokenId}
							<a href={`/trees/${tokenId}`} class="underline" target="_blank">
								#{tokenId}
							</a>
							&nbsp;
						{/each}
					</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
