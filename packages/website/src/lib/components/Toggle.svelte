<script>
	import { slide } from 'svelte/transition';
	let isOpen = false;
	export let question = '';

	const toggle = () => (isOpen = !isOpen);
</script>

<div class="flex flex-col">
	<button class="toggle" on:click={toggle} aria-expanded={isOpen} class:toggle--opened={isOpen}>
		<h2 class="" class:toggle__question--opened={isOpen}>
			{question}
		</h2>
		<img src="/1f332.svg" alt="" />
	</button>
	{#if isOpen}
		<div class="pt-6" transition:slide={{ duration: 250 }}>
			<slot />
		</div>
	{/if}
</div>

<style lang="postcss">
	.toggle {
		@apply flex flex-row justify-between;
		@apply font-bold hover:text-green-600;
	}
	.toggle img {
		@apply h-6 ml-2;
	}
	.toggle--opened {
		@apply text-green-600;
	}

	img {
		transition: transform 0.5s ease-in;
	}
	[aria-expanded='true'] img {
		transform: rotate(-180deg);
	}
</style>
