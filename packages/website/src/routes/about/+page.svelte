<script lang="ts">
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import Quote from '$lib/components/Quote.svelte';
	import SvelteSeo from 'svelte-seo';
	const title = 'About | The Merge Trees';
	const description = 'About The Merge Trees';
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

<main class="py-20 flex flex-col justify-items-center text-justify max-w-screen-md mx-auto">
	<h1>About</h1>
	<p>
		While doing some research about on-chain NFT possibilities, I felt in love with trees and their
		digital modeling. And plan to go way further than trees.
	</p>
	<section>
		<h2>Summary</h2>
		<ul class="list-disc list-inside mt-2">
			<li>Artwork is generative and stored fully on-chain.</li>
			<li>Artwork evolves with blocks and transfers.</li>
			<li>All MergeTrees will grow or decline depending of the game events.</li>
			<li>
				The contract has 2 phases:
				<ol class="list-decimal list-inside mt-2 ml-4">
					<li>
						<b>Public mint</b> for everyone until the initial total supply is reached = 100 + 3 artist's
						proofs.
					</li>
					<li>
						<b>Stag hunt</b> to play a worlwide cooperation game and earn rewards (NFT(s), rare traits...).
					</li>
				</ol>
			</li>
		</ul>
	</section>

	<section id="markers">
		<h2>Markers</h2>
		<p>
			Change the marker of your tree from a curated selection of NFT collection that you own thanks
			to <ExternalLink href="https://eips.ethereum.org/EIPS/eip-4883">EIP-4883</ExternalLink>.
			<br />
			Pick a blossom flower 💮️ or an autumn leaf 🍁️ rather than the default 🟢 !
		</p>
		<p class="mt-4">
			A guide will be published soon. In the meantime, you can propose your composable marker <ExternalLink
				href="https://github.com/anthonygraignic/the-merge-trees/pulls"
				>make a Pull Request</ExternalLink
			>
		</p>
	</section>
	<section id="on-chain">
		<h2>On-chain artwork</h2>
		<p>
			MergeTrees are stored fully onchain on Ethereum and do not host the images files nor metadata
			on other network like IPFS or Arweave.
		</p>
		<p class="mt-2">
			From the tree's <a href="#traits">traits</a>, all the branches characteristics are computed
			and put together to draw the entire tree. Once it is ready, the resulting SVG is encoded in
			base64.
		</p>
		<h3 class="mt-4">Rendering</h3>
		<p>
			Rendering trees on-chain wasn't easy, but it's real now. A first approach involved doing a lot
			of maths in Solidity to calculate each branch position. But there were a lot of limitations
			about the tree parameters.
			<br />
			So after some research, I decided to leverage the power of
			<ExternalLink href="https://www.w3.org/TR/SVG2/">SVG</ExternalLink>
			and its
			<ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use"
				>&lt;use href &gt;</ExternalLink
			>
			, which allow to re-use parts of a document. For the tree, each branch is drawn by reusing the
			previous one and scaling/rotating it.
			<br />
			That's how it is stored on-chain and for old computers why you can experience some slowness (especially
			on animated one, but hey see it as an homage to PoW 😉️).
			<br />
			<br />
			A detailed article will be published soon. For now, you can check the
			<a href="#modeling">Modeling</a> section.
		</p>
	</section>

	<section id="stag-hunt">
		<h2>What is a stag hunt ?</h2>
		<p>
			In game theory, a <ExternalLink href="https://en.wikipedia.org/wiki/Stag_hunt"
				>stag hunt</ExternalLink
			> is a coordination game where two or more players can choose to cooperate and hunt a stag together
			for a large reward, or hunt a hare individually for a smaller and selfish reward.
		</p>
		<p>
			The French philosopher Jean-Jacques Rousseau first introduced this game in "A Discourse on
			Inequality" in 1755. The game illustrates the conflict between social cooperation and
			indidivual benefit.
		</p>

		<h3>Formal definition (2 players)</h3>
		<div class="flex items-center justify-center">
			<table class="table-auto mt-2">
				<tbody>
					<tr>
						<td></td>
						<td class="border px-4 py-2">Stag</td>
						<td class="border px-4 py-2">Hare</td>
					</tr>
					<tr>
						<td class="border px-4 py-2">Stag</td>
						<td class="border px-4 py-2 font-bold">3, 3</td>
						<td class="border px-4 py-2">0, 1</td>
					</tr>
					<tr>
						<td class="border px-4 py-2">Hare</td>
						<td class="border px-4 py-2">1, 0</td>
						<td class="border px-4 py-2 font-bold">1, 1</td>
					</tr>
				</tbody>
			</table>
		</div>

		<h3>Stag 🦌</h3>
		<p class="mt-2">
			To capture the stag, you must call the <code>huntStag</code> function and more than
			<b>51% of the supply need to be "mature trees"</b> i.e. they have the maximum segments level (acquired
			by transfers), including the caller tree.
		</p>

		<h4 class="mt-2">Reward & consequences:</h4>
		<ul class="list-disc list-inside mt-2">
			<li>
				All "mature trees" are cut i.e. their segments are back to minimum and their 'stags'
				attribute is incremented.
			</li>
			<li>They are all eligible to claim a <b>new NFT</b>.</li>
			<li>Animated trees (from hare hunt) are not animated anymore</li>
			<li>Growth is back (decline cancelled)</li>
			<li>The <code>stags</code> trait is incremented.</li>
		</ul>
		<h3>Hare 🐰</h3>
		<p class="mt-4">
			To capture a hare, you must call the <code>huntHare</code> function and pay a fee greater or equal
			to:
		</p>
		<img
			src="/images/hare_hunt_min_price.png"
			alt="Hare Hunt Min price formula"
			class="my-4 dark:invert max-w-md mx-auto"
		/>

		<h4 class="mt-2">Reward & consequences:</h4>
		<ul class="list-disc list-inside mt-2">
			<li>Your tree gets <code>animated</code> trait until the next stag hunt</li>
			<li><b>A new cloned NFT</b> with lower value traits.</li>
			<li>You trigger decline for everyone for 211810 blocks</li>
			<li>Your tree is excluded from cooperation count for 211810 blocks</li>
			<li>The <code>hares</code> trait is incremented.</li>
		</ul>

		<div class="mt-4">
			<h3>Diagram</h3>
			<img
				src="https://mermaid.ink/svg/pako:eNp1VMuO2jAU_ZUrS2wYRhRVVSVUgTpDW7oYhIBF2wRpTHIJ0Tg28qN0BOzbdT-gv9hP6LWTTACVLJL7PD732PGeJSpF1mdroXbJhmsLi1EsgZ6HXNrIv5YAt7cDgLnbbsXz_rMBEywY9F69Hh7L6oXm0qxRd-_cc3eOQpTheyWUjhYqywSWzrJC5_oJdTRHW5lV_M5pWVrlcmHpw1c0B5hbolfmWq3T7EQdAtuqz5dF4Q0b5-mHojGZPpcNA1Lm_X3MHsfcwOBNr0Xs1BY1t7mSQ3i30t0BMbNOI1iNOHyM2fFlgdB9Ti2b4Y7r1PiVM6ic5Qvdsx5P-GSakmvDcsw1Ekv_CSynPE-hyOVU5wlCrXidPqHhQzUNb1_QiKVxq0zz7QYM8WmmqcoIiaDuBc-LiJRptye4g8nHhWm3wSpIfALWSgPyZANqDXaDQNKRNMsrYJ-02kV___z-GazQzIUIipprPTM0aD2BYACXeRF2xVRHyllI6r2SWYlVpvxU5uam4fM_4Wf4HemAhAPLEw9chTClLpTpiUz0Q2CjdsPSq6QkpiROqVSP1PEBL1e73RC4bHsfhsGUuqiymg3Tq_UjTEQu0Uv4q3bOVQzeF1gJlTzVktaFHuHDj0Q4Q1NGwUqJ41qropGQ5r-AIA1YhxWoCzp4dDfsPWrMaLcLjFmfTInOai5i1ilTq9yaKeqZ2vl8720sj4TAnVXzZ5mwvtUOO8xtUxp2lHMSt6iDmOZW6YfyFgqXUYdtufymFJWsuTBUo5XLNpV3_Acv-ZHs"
				alt="Mermaid flow chart diagram"
				class="max-w-full mx-auto"
			/>
		</div>
	</section>
	<section>
		<h2>Artwork Evolution</h2>
		<h3>Transfers 🤝</h3>
		<p>
			At every NFT transfer, the tree will add or remove 1 segment / level depending on the growth
			phase. Allowing it to be a simple trunk or a beautiful tree with 6 segments.
		</p>
		<div class="grid grid-cols-3 gap-4 mt-2">
			<img src="/images/trees/transfers/g_transfer_0.png" alt="" />
			<img src="/images/trees/transfers/g_transfer_1.png" alt="" />
			<img src="/images/trees/transfers/g_transfer_2.png" alt="" />

			<img src="/images/trees/transfers/d_transfer_0.png" alt="" />
			<img src="/images/trees/transfers/d_transfer_1.png" alt="" />
			<img src="/images/trees/transfers/d_transfer_2.png" alt="" />
		</div>
		<br />
		Note: if you go to 0 segment, a special message will display.
		<br />
		<br />
		<h3>Length growth 📈 or decline 📉?</h3>
		<br />
		<p>
			For every block mined in the blockchain, the tree will grow in length if we are in a growing
			phase or decline otherwise. A <code>growthDivider</code> is also set to tweak it more precisely.
		</p>
		<br />
		<div class="grid grid-cols-3 gap-4 mt-2">
			<img src="/images/trees/blocks/R2_block80.png" alt="" />
			<img src="/images/trees/blocks/R2_block150.png" alt="" />
			<img src="/images/trees/blocks/R2_block300.png" alt="" />

			<img src="/images/trees/blocks/R4_block1300.png" alt="" />
			<img src="/images/trees/blocks/R4_block200.png" alt="" />
			<img src="/images/trees/blocks/R4_block10.png" alt="" />
		</div>
		<h3>Colors 🎨</h3>
		Since we all share the same planet but have a highly unequal impact on it, certain MergeTrees have
		the unique ability to alter 1 bit of the color across ALL trees.
		<br /> If they manage to reach consensus, they might be able to turn the trees and their markers
		to
		<span class="text-red-500">red</span>, <span class="text-blue-500">blue</span> or
		<span class="text-yellow-500">yellow</span>
		(...).
	</section>
	<section id="traits">
		<h2>MergeTree Traits</h2>
		<p>
			MergeTrees are generated pseudo-randomly based Ethereum block hashes and have the following
			traits:
		</p>
		<ul class="list-disc list-inside mt-2">
			<li><b>Length</b>: between 20 and 227</li>
			<li><b>Diameter</b>: between 5 and 40</li>
			<li>
				<b>D</b>: Fractal dimension (Hausdorff), between 2 and 3 (stored as an index of precomputed
				values)
			</li>
			<li>
				<b>Δ</b>: Leonardo da Vinci's exponent, between 1.93 and 2.3 (stored as an index of
				precomputed values)
			</li>
			<li><b>Angle</b>: (20°, 30°, 45°, 60°, 90°)</li>
			<li><b>Branches</b>: (2, 3, 4)</li>
			<li>
				<b>Animated</b>: if the tree growth or decline is animated each 12 seconds (PoS block time)
			</li>
		</ul>
		<p class="mt-4">
			You can preview your tree in the <a href="/playground">Playground</a>.
		</p>
	</section>
	<section id="modeling">
		<h2>Tree Digital Modeling</h2>

		<p>For modeling the tree, I used a fractal canopy as described by Benoît Mandelbrot in:</p>
		<Quote
			>B. B. Mandelbrot, The Fractal Geometry of Nature (Freeman, San Francisco, 1983).
			<ExternalLink href="https://archive.org/details/fractalgeometryo00beno"
				>ISBN 0716711869</ExternalLink
			>
		</Quote>

		<p>
			But calculating angles and floating numbers in Solidity is hard (integers are not made for
			it), you can have a look at this great work <ExternalLink
				href="https://github.com/mds1/solidity-trigonometry">solidity-trigonometry</ExternalLink
			> by mds1 based on the original solidity work of <ExternalLink
				href="https://twitter.com/LefterisJP">Lefteris Karapetsas</ExternalLink
			> who ported Dave Dribin's <ExternalLink href="http://www.dribin.org/dave/trigint/"
				>trigint C library</ExternalLink
			>, which in turn is based on an <ExternalLink
				href="http://web.archive.org/web/20120301144605/http://www.dattalo.com/technical/software/pic/picsine.html"
				>article</ExternalLink
			> by Scott Dattalo. It made me realize the complexity of tree modelling and computing costs on
			the EVM.
		</p>
		<p>
			My solution was to leverage leverage the power of
			<ExternalLink href="https://www.w3.org/TR/SVG2/">SVG</ExternalLink>
			(using the client visualizer) and its
			<ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use"
				>&lt;use href &gt;</ExternalLink
			>, which allow to re-use parts of a document.
			<br />
			Making it even more interactive and able to reach 7-8 segments rather than only 4 ! The file size
			was also reduced by 25x (74.9 kB to the actual 2.9 kB) and rendering from smartcontract went from
			4sec to 0.2sec in test environment. The only downside is the rendering on the browser or client
			which is a bit slower. A lot of QA solved this by finding acceptable tradeoffs.
		</p>
		<p class="mt-2">
			In the smartcontract, the trunk is drawn first, then the branches are drawn recursively.
			<br />
			The length and diameter are scaled at each level from the trunk.
		</p>
		<p>
			For a length at level k, with N the number of daughters branchs and delta the Hausdorff
			dimension:
			<img
				src="/images/equation-length.png"
				alt="Length trait"
				class="my-4 dark:invert max-w-md mx-auto"
			/>
		</p>

		<p>
			For a diameter at level k, with N the number of daughters branchs and Δ the Leonardo da
			Vinci's exponent:
		</p>
		<img
			src="/images/equation-diameter.png"
			alt="Diameter trait"
			class="my-4 dark:invert max-w-md mx-auto"
		/>
		<p>
			Each NFT has different values for Δ and D, stored in <a href="#traits">traits</a>, making it
			unique.
		</p>
		<h3>Leonardo da Vinci's exponent and his rule of trees</h3>
		<p>
			500 years ago, Leonardo da Vinci, after hours of observation, defined an empiric rule to help
			people draw trees:

			<Quote>
				All the branches of a tree at every stage of its height when put together are equal in
				thickness to the trunk below them.
			</Quote>

			The exponent with a range of 1.93 to 2.3 help to embrace the diversity of tree species.
		</p>
		<h3>Hausdorff dimension</h3>
		<p>
			The Hausdorff dimension is a mathematical concept used to quantify the complexity of fractal
			shapes by extending traditional notions of dimensionality.
			<ExternalLink href="https://en.wikipedia.org/wiki/Hausdorff_dimension">Wikipedia</ExternalLink
			>
		</p>
		<p class="mt-4">
			A more detailled approach on tree modelling can be found in this research publication:
		</p>
		<Quote>
			Eloy, C. (2011). Leonardo’s Rule, Self-Similarity, and Wind-Induced Stresses in Trees.
			Physical Review Letters, 107(25).
			<ExternalLink href="https://doi.org/10.1103/physrevlett.107.258101"
				>https://doi.org/10.1103/physrevlett.107.258101
			</ExternalLink>
		</Quote>
	</section>
	<section id="seeder">
		<h2>Seeder contract</h2>
		<p>
			The MergeTree Seeder contract is used to determine traits during the minting process. It is
			upgradeable to support future trait generation algorithm upgrades and can be locked by the
			team to prevent any further update.
			<br />
			Currently, traits are determined using pseudo-random number generation:
			<br /><br />
			<code>keccak256( abi.encodePacked( block.prevrandao, address(this), tokenId ) );</code>
			<br /><br />
			Please note that it is not truly random and could be predicted and/or biased by validators, but
			in a limited way.
			<br />
			See
			<ExternalLink href="https://eips.ethereum.org/EIPS/eip-4399#security-considerations"
				>Security considerations of EIP-4399</ExternalLink
			>.
		</p>
	</section>
	<section id="license">
		<h2>License</h2>
		<p>
			The artworks are licensed in <ExternalLink href="https://creativecommons.org/licenses/by/4.0/"
				>CC BY
			</ExternalLink>
			and the code in
			<ExternalLink href="https://www.gnu.org/licenses/gpl-3.0.html">GPL-3.0</ExternalLink>.
		</p>
		<br />
		<p>Disclaimer: You are using this site and contracts at your own risk.</p>
	</section>
	<!-- <p class="mt-8">
		PS: You might find references of this project back in 2022. Yep this is a side project that was
		kept in a folder for months/years.<br />
		But I finally decided to launch it as is, by simplifying parts of it and adding the stag hunt game.
	</p> -->
</main>

<style lang="postcss">
	section {
		@apply px-2 sm:px-4 mt-4;
	}
	h2 {
		@apply py-2 text-green-600;
		border-bottom: 1px dotted gray;
	}
	a {
		@apply underline;
	}
	h3 {
		@apply mt-4;
	}
</style>
