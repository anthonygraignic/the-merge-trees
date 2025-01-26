<script>
	import { connect, connectedAccount } from '$lib/wallet';

	export let error = undefined;

	async function connectWeb3() {
		try {
			await connect();
		} catch (err) {
			error = err;
		}
	}
</script>

{#if $connectedAccount}
	<slot />
{:else}
	<div class="wrapper">
		<button
			on:click={connectWeb3}
			class="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 mr-2 mb-2"
		>
			<svg
				aria-hidden="true"
				focusable="false"
				data-prefix="fab"
				data-icon="ethereum"
				role="img"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 320 512"
				><path
					fill="currentColor"
					d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"
				/></svg
			>
			Connect</button
		>
	</div>
{/if}

<style lang="postcss">
	.wrapper {
		@apply flex justify-center items-center;
	}
	.wrapper svg {
		@apply w-4 h-4 mr-2 -ml-1 text-[#626890];
	}
</style>
