<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let error = '';

	const dispatch = createEventDispatcher();

	const onKeyUp = (event) => {
		if (error) {
			if (event.key === 'Escape') {
				event.preventDefault();
				error = '';
			}
		}
	};
</script>

<svelte:window on:keyup={onKeyUp} />
{#if error}
	<div
		class="z-50 bg-slate-800 dark:bg-slate-100 fixed bottom-2 right-2 left-2 rounded-2xl text-white dark:text-gray-800 text-2xl text-center"
	>
		<div class="m-3 relative">
			<button
				class="bg-transparent border-0 absolute right-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer font-bold text-white dark:text-gray-800 text-2xl"
				on:click={() => {
					dispatch('close');
					error = '';
				}}
			>
				X
			</button>
			{@html error}
		</div>
	</div>
{/if}
