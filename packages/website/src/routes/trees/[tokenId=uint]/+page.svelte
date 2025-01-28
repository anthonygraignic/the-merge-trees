<script lang="ts">
	import { PUBLIC_EXPLORER_URL, PUBLIC_MERGETREES_CONTRACT_ADDRESS } from '$env/static/public';
	import ErrorComponent from '$lib/components/ErrorComponent.svelte';
	import OnlyConnected from '$lib/components/web3/OnlyConnected.svelte';
	import { provider, connectedAccount } from '$lib/wallet';
	import mergeTreesArtifact from 'merge-trees-contracts/artifacts/contracts/TheMergeTree.sol/TheMergeTree.json';

	import SvelteSeo from 'svelte-seo';
	import { ethers } from 'ethers';
	import { get } from 'svelte/store';
	import { mergeTreesABI, type TheMergeTree } from '$lib/contracts';
	import { networkReadiness } from '$lib/blockchain/NetworkReader';
	import { browser } from '$app/environment';
	import OwnerActionsBlock from '$lib/components/token-owner/OwnerActionsBlock.svelte';
	import { shortenAddress } from '$lib/blockchain/utils';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import MarketplaceLinkList from '$lib/components/MarketplaceLinkList.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
	const tokenId = BigInt(data.tokenId);

	let error = undefined;

	let mergeTreesContract: TheMergeTree;
	export let metadata = {};
	let tokenOwner: string;
	let blockNumber: bigint;
	let declineUntil: bigint;
	let declineUntilForTokenId: bigint;
	// let marker;

	/**
	 * @param {bigint} tokenId
	 */
	async function updateMetadata(tokenId: bigint) {
		console.log('updateMetadata');
		try {
			const encodedNft = await mergeTreesContract.tokenURI(tokenId);
			metadata = JSON.parse(window.atob(encodedNft.substring(29)));
		} catch (err) {
			error = err;
			console.error(err);
		}
	}

	connectedAccount.subscribe(async (connectedAccount) => {
		if (connectedAccount) {
			await initContractWithSigner();
		}
	});

	if (browser) {
		networkReadiness.subscribe((readiness) => {
			if (readiness) {
				initContractWithSigner();
			}
		});
	}

	async function initContractWithSigner() {
		console.log('initContractWithSigner');
		try {
			mergeTreesContract = new ethers.Contract(
				PUBLIC_MERGETREES_CONTRACT_ADDRESS,
				mergeTreesArtifact.abi,
				await get(provider).getSigner()
			);
			updateMetadata(tokenId);
			declineUntil = await mergeTreesContract.declineUntil();
			blockNumber = BigInt(await get(provider).getBlockNumber());
			// marker = await mergeTreesContract._markerTokenForTokenId(tokenId);
			tokenOwner = await mergeTreesContract.ownerOf(tokenId);

			declineUntilForTokenId = await mergeTreesContract.tokenIdsDeclineUntil(tokenId);
		} catch (err) {
			console.error(err);
			error = 'Failed to load contract with signer wallet';
		}
	}

	provider.subscribe(async (provider) => {
		if (provider) {
			provider.on('block', async (blockNumber) => {
				if (blockNumber % 6) {
					blockNumber = BigInt(blockNumber);
					await updateMetadata(tokenId);
				}
				// Emitted on every block change
			});
		}
	});

	$: imgSrc = metadata?.image ?? '/tree_m2_s8_a27_l250_d25.svg';
	$: name = metadata?.name ?? `The Merge Tree #${tokenId}`;
	$: title = name;
	$: description = metadata?.description ?? 'A beautiful tree';
</script>

<SvelteSeo
	{title}
	{description}
	twitter={{
		site: '@themergetrees',
		title,
		description,
		image: imgSrc,
		imageAlt: name
	}}
	openGraph={{
		title,
		description,
		url: `https://themergetrees.xyz/trees/${tokenId}`,
		type: 'website',
		images: [
			{
				url: imgSrc,
				alt: name
			}
		]
	}}
/>
<main class="px-2 sm:px-4 pt-20">
	<ErrorComponent {error}>
		<OnlyConnected>
			<div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
				<div class="lg:col-span-8 sm:col-span-6">
					{#key metadata}
						<img class="lg:p-6 max-w-screen-md mx-auto" src={metadata?.image} alt={title} />
					{/key}
				</div>
				<div class="lg:col-span-4 sm:col-span-6">
					<h2>{name}</h2>
					<p>{description}</p>

					{#if tokenOwner}
						<p>
							Owned by:
							<ExternalLink href="{PUBLIC_EXPLORER_URL}/address/{tokenOwner}">
								{shortenAddress(tokenOwner)}
							</ExternalLink>
							{#if tokenOwner.toLowerCase() === $connectedAccount?.toLowerCase()}
								(You)
							{/if}
						</p>
					{/if}

					<p>
						<ExternalLink
							href="{PUBLIC_EXPLORER_URL}/nft/{PUBLIC_MERGETREES_CONTRACT_ADDRESS}/{tokenId}"
						>
							History
						</ExternalLink>
					</p>

					<h2>Attributes</h2>
					{#if metadata && metadata.attributes}
						<table class="table-auto">
							<thead>
								<tr>
									<th>Trait</th>
									<th>Value</th>
								</tr>
							</thead>
							<tbody>
								{#each metadata?.attributes as attribute}
									<tr></tr>
									{#if attribute.trait_type === 'angle'}
										<td>Angle 📐</td>
										<td> {attribute.value}°</td>
									{:else if attribute.trait_type === 'D'}
										<td>D <span class="text-sm">Fractal dimension (Hausdorff)</span></td>
										{#if attribute.value === 1}
											2.0
										{:else if attribute.value === 2}
											2.1
										{:else if attribute.value === 3}
											2.2
										{:else if attribute.value === 4}
											2.3
										{:else if attribute.value === 5}
											2.4
										{:else if attribute.value === 6}
											2.5
										{:else if attribute.value === 7}
											2.6
										{:else if attribute.value === 8}
											2.7
										{:else if attribute.value === 9}
											2.8
										{:else if attribute.value === 10}
											2.9
										{:else if attribute.value === 11}
											3
										{/if}
									{:else if attribute.trait_type === 'delta'}
										<td>Δ <span class="text-sm">(Leonardo da Vinci's exponent)</span></td>
										<td>
											{#if attribute.value === 0}
												1.93
											{:else if attribute.value === 1}
												2.0
											{:else if attribute.value === 2}
												2.1
											{:else if attribute.value === 3}
												2.2
											{:else if attribute.value === 4}
												2.3
											{:else if attribute.value === 5}
												2.4
											{:else if attribute.value === 6}
												2.5
											{:else if attribute.value === 7}
												2.6
											{:else if attribute.value === 8}
												2.7
											{:else if attribute.value === 9}
												2.8
											{:else if attribute.value === 10}
												2.9
											{:else if attribute.value === 11}
												3
											{/if}
										</td>
									{:else if attribute.trait_type === 'segments'}
										<td>Segments</td><td>{attribute.value}</td>
									{:else if attribute.trait_type === 'stags'}
										<td>Stags 🦌</td><td>{attribute.value}</td>
									{:else if attribute.trait_type === 'hares'}
										<td>Hares 🐰</td>
										<td>{attribute.value}</td>
									{:else}
										<td
											>{attribute.trait_type.charAt(0).toUpperCase() +
												attribute.trait_type.slice(1)}
										</td>
										<td>{attribute.value}</td>
									{/if}
								{/each}
							</tbody>
						</table>
					{/if}

					{#if declineUntil > 0 && declineUntil > blockNumber}
						<h2>📉 Global decline until</h2>
						<p>Block: {declineUntil}</p>
					{/if}

					{#if declineUntilForTokenId > 0}
						<h3>📉🌳 Decline for #{tokenId} until</h3>
						<p>
							Block: {declineUntilForTokenId}
							{#if declineUntilForTokenId < blockNumber}(now: {blockNumber}){/if}
						</p>
					{/if}

					<!-- <h2>Marker</h2> -->

					<h2>Trade on:</h2>
					<div class="flex items-center justify-start">
						<MarketplaceLinkList {tokenId} externalLink={true} />
					</div>
					{#if mergeTreesContract}
						<OwnerActionsBlock {tokenId} {tokenOwner} {mergeTreesContract} bind:error />
					{/if}
				</div>
			</div>
		</OnlyConnected>
		{#if !$connectedAccount}
			<div class="mt-4 text-center">
				<p class="mb-5 text-sm text-gray-500 dark:text-gray-400">
					Connection is mandatory to get the latest data from the chain.
					<br />
					For cached versions, you can go to
					<MarketplaceLinkList {tokenId} />
				</p>
			</div>
		{/if}
	</ErrorComponent>
</main>

<style lang="postcss">
	h2 {
		@apply mt-4;
	}

	th {
		@apply text-start;
	}
	td {
	}
</style>
