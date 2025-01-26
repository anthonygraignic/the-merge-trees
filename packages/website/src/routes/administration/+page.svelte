<script lang="ts">
	import { get } from 'svelte/store';

	import { mergeTreesABI, type TheMergeTree } from '$lib/contracts';
	import { connectedAccount, provider } from '$lib/wallet';

	import SvelteSeo from 'svelte-seo';
	import { ethers } from 'ethers';

	import OnlyConnected from '$lib/components/web3/OnlyConnected.svelte';
	import { browser } from '$app/environment';
	import { networkReadiness } from '$lib/blockchain/NetworkReader';
	import { PUBLIC_EXPLORER_URL, PUBLIC_MERGETREES_CONTRACT_ADDRESS } from '$env/static/public';

	let mergeTreesContract: TheMergeTree;
	let error: Error | string;

	let markerComposableContract: string;

	let mergeTreesOwner: string;
	let foundersDAO: string;
	let currentSupply: bigint;
	let grow: boolean;
	let growthDivider: bigint = 0n;
	let growthDeclineBlocks: bigint;
	let contractURI: string;
	let seeder: string;
	let isSeederLocked: boolean;
	let colors: string[];
	let declineUntil: bigint;
	let BEFORE_HUNT_SUPPLY: bigint;
	let hasStagHuntStarted: boolean;
	let totalPendingClaim: bigint;
	let tokenIdsDegrowthUntil;
	let pendingClaims;

	$: isMergeTreesOwner = mergeTreesOwner?.toLowerCase() === $connectedAccount?.toLowerCase();
	$: isfoundersDAO = mergeTreesOwner?.toLowerCase() === $connectedAccount?.toLowerCase();

	$: blocksToFullGrowth = 227n * BigInt(growthDivider ?? 0);
	$: dateToFullGrowth = new Date(Date.now() + Number(blocksToFullGrowth) * 12 * 1000);

	connectedAccount.subscribe(async (connectedAccount) => {
		if (connectedAccount) {
			error = '';
			await initContract();
		}
	});

	if (browser) {
		networkReadiness.subscribe((readiness) => {
			if (readiness) {
				error = '';
				initContract();
			}
		});
	}

	async function initContract() {
		console.log('initContract');
		try {
			mergeTreesContract = new ethers.Contract(
				PUBLIC_MERGETREES_CONTRACT_ADDRESS,
				mergeTreesABI,
				await get(provider).getSigner()
			);

			[
				mergeTreesOwner,
				foundersDAO,
				currentSupply,
				BEFORE_HUNT_SUPPLY,
				declineUntil,
				growthDivider,
				growthDeclineBlocks,
				contractURI,
				seeder,
				isSeederLocked,
				hasStagHuntStarted,
				totalPendingClaim
				// tokenIdsDegrowthUntilBlock
			] = await Promise.all([
				mergeTreesContract.owner(),
				mergeTreesContract.founders(),
				mergeTreesContract.totalSupply(),
				mergeTreesContract.BEFORE_HUNT_SUPPLY(),
				// mergeTreesContract.grow(),
				mergeTreesContract.declineUntil(),
				mergeTreesContract.growthDivider(),
				mergeTreesContract.growthDeclineBlocks(),
				mergeTreesContract.contractURI(),
				mergeTreesContract.seeder(),
				mergeTreesContract.isSeederLocked(),
				mergeTreesContract.hasStagHuntStarted(),
				mergeTreesContract.totalPendingClaim()
				// mergeTreesContract.tokenIdsDegrowthUntilBlock(),
			]);
		} catch (err) {
			console.error(err);
			error = 'Failed to load some contract info';
		}
		console.log(`MergeTrees owner = ${mergeTreesOwner}`);
	}

	async function setGrowthDivider() {
		try {
			mergeTreesContract.setGrowthDivider(growthDivider);
		} catch (err) {
			console.error(err);
			error = 'Failed to set growth divider';
		}
	}

	async function setGrowthDeclineBlocks() {
		try {
			mergeTreesContract.setGrowthDeclineBlocks(growthDeclineBlocks);
		} catch (err) {
			console.error(err);
			error = 'Failed to set growth decline blocks';
		}
	}

	async function approveComposableMarker() {
		try {
			mergeTreesContract.setComposableMarkerApproval(markerComposableContract, true);
		} catch (err) {
			console.error(err);
			error = 'Failed to set growth divider';
		}
	}

	async function lockSeeder() {
		try {
			mergeTreesContract.lockSeeder();
		} catch (err) {
			console.error(err);
			error = 'Failed to lock seeder';
		}
	}

	async function withdraw() {
		try {
			mergeTreesContract.withdraw();
		} catch (err) {
			console.error(err);
			error = 'Failed to withdraw';
		}
	}
</script>

<SvelteSeo title="Administration" description="Smart Contracts management only" />

<main class="px-2 sm:px-4 pt-20 flex flex-col justify-center justify-items-center items-center">
	<OnlyConnected>
		<section>
			<h1>NFT Contract</h1>
			<p>
				<a
					href="{PUBLIC_EXPLORER_URL}/address/{PUBLIC_MERGETREES_CONTRACT_ADDRESS}"
					rel="external noopener noreferrer"
					target="_blank"
					class="underline">Etherscan</a
				>
				,
				<a
					href="{PUBLIC_EXPLORER_URL}/address/{seeder}"
					rel="external noopener noreferrer"
					target="_blank"
					class="underline">Seeder ({isSeederLocked ? 'locked' : 'unlocked'})</a
				>,
				<a href={contractURI} rel="external noopener noreferrer" target="_blank" class="underline"
					>Contract URI</a
				>
			</p>

			<p>Stag hunt: {hasStagHuntStarted ? 'yes ✅, 🦌🐰' : 'no ❌'}</p>

			<p>
				Supply: {currentSupply ?? '?'} (before hunt: {BEFORE_HUNT_SUPPLY ?? '?'})
			</p>
			<p>---</p>
			<p>Growth: {declineUntil > 0 ? '📉' : '📈'}</p>
			<p>
				Degrowth until: {declineUntil} (divider: {growthDivider}, blocks: {growthDeclineBlocks})
			</p>
			<!-- <p>{tokenIdsDegrowthUntilBlock}</p> -->

			<p>---</p>
			<p>Total pending claim: {totalPendingClaim}</p>
			<!-- <p>{tokenIdsDegrowthUntilBlock}</p>
			<p>{pendingClaims}</p> -->

			<p>---</p>
		</section>

		{#if isMergeTreesOwner}
			<section>
				<h1>Owner</h1>
				<p>---</p>
				{#if !isSeederLocked}
					<button
						type="button"
						on:click={lockSeeder}
						disabled={!isMergeTreesOwner || isSeederLocked}
						class="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 disabled:cursor-not-allowed"
						>Lock seeder</button
					>
				{/if}

				<fieldset>
					<label
						for="growthdivider"
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
						>Growth Divider (full size in {blocksToFullGrowth} blocks)
						<br />{dateToFullGrowth}
					</label>
					<input
						type="number"
						id="growthdivider"
						name="growthdivider"
						bind:value={growthDivider}
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					/>
				</fieldset>
				<button
					type="button"
					on:click={setGrowthDivider}
					disabled={!isMergeTreesOwner}
					class="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 disabled:cursor-not-allowed"
					>Set growth divider</button
				>

				<fieldset>
					<label
						for="growthdivider"
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
						>Growth Decline blocks
					</label>
					<input
						type="number"
						id="growthdivider"
						name="growthdivider"
						bind:value={growthDeclineBlocks}
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					/>
				</fieldset>
				<button
					type="button"
					on:click={setGrowthDeclineBlocks}
					disabled={!isMergeTreesOwner}
					class="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 disabled:cursor-not-allowed"
					>Set growth decline blocks</button
				>

				<!-- setComposableMarkerApproval -->
				<fieldset>
					<label
						for="composablemarkercontract"
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
						>Composable marker contract:</label
					>
					<input
						type="text"
						id="composablemarkercontract"
						minlength="1"
						name="composablemarkercontract"
						bind:value={markerComposableContract}
						placeholder="0x..."
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					/>
				</fieldset>
				<button
					type="button"
					on:click={approveComposableMarker}
					disabled={!isMergeTreesOwner}
					class="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 disabled:cursor-not-allowed"
				>
					Approve marker composable contract ✅
				</button>
				<!-- setSeeder -->
			</section>
		{/if}

		{#if isfoundersDAO}
			<section>
				<h1>Founders / DAO</h1>
				<p class="text-sm">Receive ETH and composable tokens</p>
				<p>---</p>

				<button
					type="button"
					on:click={withdraw}
					disabled={!isfoundersDAO}
					class="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 disabled:cursor-not-allowed"
					>Withdraw 💰</button
				>
				<!-- setFoundersDAO -->
			</section>
		{/if}
	</OnlyConnected>
	{#if error}
		<p class="text-red-600">
			{error.toString()}
		</p>
	{/if}
</main>

<style lang="postcss">
	section {
		@apply flex flex-col items-center;
	}
</style>
