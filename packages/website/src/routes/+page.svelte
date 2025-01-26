<script lang="ts">
	import SvelteSeo from 'svelte-seo';

	import Faq from '$lib/components/Faq.svelte';
	import ErrorModal from '$lib/components/ErrorModal.svelte';
	import OpenMint from '$lib/components/mint/OpenMint.svelte';
	import { connectedAccount } from '$lib/wallet';
	import OnlyConnected from '$lib/components/web3/OnlyConnected.svelte';

	const title = 'The Merge Trees | Generative on-chain forest';
	const description =
		'A generative art experiment to build an on-chain evolving forest. Respectful human actions and time are the only things that can save it.';

	let error: string = '';
</script>

<SvelteSeo
	{title}
	{description}
	twitter={{
		site: '@themergetrees',
		title,
		description,
		image: 'https://themergetrees.xyz/logo.png',
		imageAlt: 'The Merge Trees Logo'
	}}
	openGraph={{
		title,
		description,
		url: 'https://themergetrees.xyz',
		type: 'website',
		images: [
			{
				url: 'https://themergetrees.xyz/logo.png',
				alt: 'The Merge Trees Logo'
			}
		]
	}}
/>

<main>
	<div class="bg-green-100 dark:bg-green-900 w-full pt-10">
		<section
			class="grid sm:grid-cols-2 grid-cols-1 items-center sm:justify-items-start justify-items-center gap-2 max-w-5xl mx-auto my-20"
		>
			{#if $connectedAccount}
				<OpenMint bind:error />
			{:else}
				<div class="text-lg">
					<p>Trees evolving on-chain in 2 phases:</p>
					<ol class="list-decimal list-inside mt-2">
						<li><b>Open Mint</b>: 100 NFTs available at 0.07233Ξ</li>
						<li><b>Stag Hunt</b>: Shape the forest’s future</li>
					</ol>
					<br />
					<br />
					<p class="text-xl font-bold">Will you be able to grow the forest ?</p>

					<div class="mt-8">
						<OnlyConnected />
					</div>
				</div>
				<div class="max-w-xs">
					<img src="themerge-trees-example512.gif" alt="Merge Tree" />
				</div>
			{/if}
		</section>
	</div>

	<section>
		<div class="mt-10">
			<p class="mt-2">
				The Merge Trees is a generative art experiment that creates an evolving on-chain forest,
				inviting reflection on the intricate connections between humans, trees, and the digital
				world.
				<br />It serves several purposes:
			</p>
			<ul class="list-disc list-inside mt-2">
				<li>
					<b>Celebrate a historic milestone </b>as Ethereum transitioned from Proof of Work to Proof
					of Stake 🐼, reducing its energy consumption by 99.95%.
				</li>
				<li>
					<b>Watch trees evolve</b> through your actions and as <strike>time</strike> blocks goes on
				</li>
				<li>
					Engage in a <b>stag hunt game</b>, fostering cooperation to nurture a thriving forest or
					pursuing self-interest at the forest's expense.
				</li>
			</ul>
			<p class="mt-4">You can find out more info below:</p>
		</div>

		<Faq />
	</section>
</main>
<ErrorModal bind:error />

<style lang="postcss">
	main {
		@apply pb-4 text-justify;
		@apply flex flex-col items-center;
	}
	section {
		@apply px-2 sm:px-4;
	}
	li {
		@apply ml-4 mt-1;
	}
</style>
