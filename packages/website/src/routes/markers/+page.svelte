<script lang="ts">
	import SvelteSeo from 'svelte-seo';
	const title = 'Markers | The Merge Trees';
	const description =
		'Update the marker of your Merge Tree, for a blossom flower or an autumn leaf.';
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

<main class="py-20 flex flex-col items-center justify-items-center">
	<h1>Soon ...</h1>
	<p>
		Change the marker of your tree from a curated selection of NFT collection that you own thanks to <a
			href="https://eips.ethereum.org/EIPS/eip-4883"
			class="underline"
			rel="external noopener noreferrer"
			target="_blank">EIP-4883</a
		>.
		<br />
		Pick a blossom flower 💮️ or an autumn leaf 🍁️ !
	</p>
</main>
