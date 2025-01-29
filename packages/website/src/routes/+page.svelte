<script lang="ts">
	import SvelteSeo from 'svelte-seo';

	import Faq from '$lib/components/Faq.svelte';
	import ErrorModal from '$lib/components/ErrorModal.svelte';
	import OpenMint from '$lib/components/mint/OpenMint.svelte';
	import { connectedAccount } from '$lib/wallet';
	import OnlyConnected from '$lib/components/web3/OnlyConnected.svelte';
	import ExternalLink from '$lib/components/ExternalLink.svelte';

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

<main class="flex flex-col items-center pb-4 text-justify">
	<div class="bg-green-100 dark:bg-green-900 pt-10 w-full">
		<section
			class="grid sm:grid-cols-2 grid-cols-1 items-center sm:justify-items-start justify-items-center gap-2 max-w-5xl mx-auto my-20"
		>
			{#if $connectedAccount}
				<OpenMint bind:error />
			{:else}
				<div class="text-lg">
					<p>Trees evolving on-chain in 2 phases:</p>
					<ol class="list-decimal list-inside mt-2">
						<li><b>Public Mint</b>: 100 NFTs available at 0.07233Ξ</li>
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

	<section class="max-w-screen-md mx-auto">
		<div class="mt-10">
			<p class="mt-2 mb-4">
				The Merge Trees is a generative art experiment that creates an evolving on-chain forest,
				inviting reflection on the intricate connections between humans, trees, and the digital
				world.
			</p>
			<p>It serves several purposes:</p>
			<ul class="list-disc list-inside mt-2">
				<li>
					<b>Celebrate a historic milestone 🐼</b> as Ethereum transitioned from Proof of Work to Proof
					of Stake , reducing its energy consumption by 99.95%.
				</li>
				<li>
					<b>Watch trees evolve</b> through your actions and as <strike>time</strike> blocks goes on.
				</li>
				<li>
					Engage in a <b>stag hunt game</b>, fostering cooperation to nurture a thriving forest or
					pursuing self-interest at the forest's expense.
				</li>
			</ul>
		</div>
		<div>
			<h1>How it works ?</h1>
			<ol class="list-decimal list-inside mt-2">
				<li>Mint your tree</li>
				<li>Transfer/sell/buy it to watch it grow</li>
				<li>
					Start to play when the public mint is over: Hunt the stag by cooperating or the hare
					individually
				</li>
				<li>Shape the forest: Every action impacts the dynamics of the game for all players.</li>
			</ol>

			<div class="text-center mt-6">
				<a
					href="/about"
					class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
					>Learn more</a
				>
			</div>
		</div>
		<div>
			<h1>Why Trees and what is 'The Merge' ?</h1>
			<p>
				<b>Trees</b> can be found everywhere in the world and are essential for our environment.
				They are living beings and used in many civilizations as a symbol for life.
				<br />
				The Merge Trees want to represent the life happening on the Ethereum blockchain through blocks,
				events, logs (...) and the community behind it.
			</p>
			<p>
				<br />
				<ExternalLink href="https://ethereum.org/en/upgrades/merge/"><b>The Merge</b></ExternalLink>
				is an upgrade of the Ethereum blockchain that switched from Proof of Work to Proof of Stake consensus.<br
				/>
				This eliminated the need for energy-intensive mining, and instead secures the network using staked
				ether.
			</p>
		</div>
	</section>
</main>
<ErrorModal bind:error />

<style lang="postcss">
	section {
		@apply px-2 sm:px-4;
	}
	h1 {
		@apply text-2xl font-bold text-green-600 mt-4;
	}
	li {
		@apply ml-4 mt-1;
	}
</style>
