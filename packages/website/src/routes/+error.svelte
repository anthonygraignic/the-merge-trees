<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import SvelteSeo from 'svelte-seo';
</script>

<SvelteSeo title="Error {$page.status} | The Merge trees" description={$page.error.message} />
<main
	class="px-2 sm:px-4 pt-20 flex flex-col justify-center justify-items-center items-center text-center"
>
	<div class="pt-16">
		<img width="400px" height="300px" src="/errors/broken_tree.svg" alt="Broken tree" />
	</div>
	<div class="pt-4">
		<h1>{$page.status}</h1>
		<h2>{$page.error.message}</h2>
		{#if import.meta.env.DEV}
			<p class="break-all">{$page.error.stack}</p>
		{/if}
	</div>
</main>

<style lang="postcss">
	h1 {
		@apply text-9xl font-bold;
	}
	h2 {
		@apply text-xl font-semibold pt-4;
	}
</style>
