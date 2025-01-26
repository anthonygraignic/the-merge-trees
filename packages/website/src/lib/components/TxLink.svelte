<script lang="ts">
	import { PUBLIC_EXPLORER_URL } from '$env/static/public';
	import { shortenAddress } from '$lib/blockchain/utils';
	import ExternalLink from './ExternalLink.svelte';

	export let txHash: string;
</script>

<ExternalLink href="{PUBLIC_EXPLORER_URL}/tx/{txHash}">
	{shortenAddress(txHash)}
</ExternalLink>
