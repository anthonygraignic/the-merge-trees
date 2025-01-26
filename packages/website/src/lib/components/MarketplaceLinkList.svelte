<script>
	import { PUBLIC_MERGETREES_CONTRACT_ADDRESS } from '$env/static/public';
	import ExternalLink from './ExternalLink.svelte';

	export let tokenId;
	export let externalLink = false;

	let marketplaces = [
		{
			name: 'OpenSea',
			url: `https://opensea.io/assets/ethereum/${PUBLIC_MERGETREES_CONTRACT_ADDRESS}/${tokenId}`
		},
		{
			name: 'LooksRare',
			url: `https://looksrare.org/collections/${PUBLIC_MERGETREES_CONTRACT_ADDRESS}/${tokenId}`
		},
		{
			name: 'X2Y2',
			url: `https://x2y2.io/eth/${PUBLIC_MERGETREES_CONTRACT_ADDRESS}/${tokenId}`
		},
		{
			name: 'Rarible',
			url: `https://rarible.com/token/${PUBLIC_MERGETREES_CONTRACT_ADDRESS}:${tokenId}`
		},
		{
			name: 'Blur',
			url: `https://blur.io/eth/asset/${PUBLIC_MERGETREES_CONTRACT_ADDRESS}/${tokenId}`
		}
	];
</script>

{#each marketplaces as { name, url }, i}
	{#if externalLink}
		<ExternalLink href={url}>{name}</ExternalLink>
	{:else}
		<a href={url} rel="external noopener" target="_blank" class="underline">{name}</a>
	{/if}

	{#if i !== marketplaces.length - 1}
		<span>, </span>
	{/if}
{/each}
