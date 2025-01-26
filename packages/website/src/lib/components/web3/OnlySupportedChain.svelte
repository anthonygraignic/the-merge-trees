<script>
	import { getChainName } from '$lib/utils/chains';

	import { chainId } from '$lib/wallet';

	export let supportedChainId = 0;
	let isChainSupported = false;

	$: changeChain($chainId);

	function changeChain(chainId) {
		isChainSupported = false;
		try {
			isChainSupported = supportedChainId === parseInt(chainId, 16);
		} catch (e) {
			isChainSupported = false;
			console.log(`Connected to ${chainId} with a supported chain: ${supportedChainId}`);
		}
	}
</script>

{#if !isChainSupported}
	<div class="text-center py-8">
		<h2>Unknown network / chain</h2>
		<p class="text-center py-4">
			Please change your network on MetaMask for:
			<br />
			<b>
				{getChainName(supportedChainId)}
			</b>
			<br />
			<em class="text-sm">You are on: {getChainName(parseInt($chainId, 16))}</em>
		</p>
	</div>
{:else}
	<slot />
{/if}
