<script>
	import SvelteSeo from 'svelte-seo';
</script>

<SvelteSeo title="QA Contracts" description="For test purposes only" />

<main class="pt-20">
	<div class="grid sm:grid-cols-4 grid-cols-1 items-center justify-items-center gap-4">
		{#each [...Array(12).keys()] as i}
			<div>
				<img src="/qa/{i}.svg" alt="merge tree" />
			</div>
		{/each}
	</div>
</main>
