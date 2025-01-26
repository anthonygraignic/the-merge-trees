<script>
	import Toggle from './Toggle.svelte';
</script>

<div class="flex flex-col pt-4 px-4 lg:px-10 max-w-5xl lg:w-[64rem]">
	<div class="faq__list__item">
		<Toggle question="Summary">
			<ul class="list-disc list-inside mt-2">
				<li>Artwork is generative and stored fully on-chain.</li>
				<li>Artwork evolves with blocks and tranfers.</li>
				<li>All MergeTrees will grow or decline depending of the game events.</li>
				<li>
					The contract has 2 phases:
					<ol class="list-decimal list-inside mt-2 ml-4">
						<li>
							A first phase of <b>open mint</b> for everyone until the initial total supply is reached
							= 100 + 3 artist's proofs.
						</li>
						<li>
							A second step of <b>stag hunt</b> to play a worlwide cooperation game and earn rewards
							(NFT(s), rare traits...).
						</li>
					</ol>
				</li>
			</ul>
		</Toggle>
	</div>
	<div class="faq__list__item">
		<Toggle question="What is a stag hunt?">
			<p>
				In game theory, a <a
					href="https://en.wikipedia.org/wiki/Stag_hunt"
					rel="external noopener noreferrer"
					target="_blank">stag hunt</a
				> is a coordination game where two or more players can choose to cooperate and hunt a stag together
				for a large reward, or hunt a hare individually for a smaller and selfish reward.
			</p>
			<p>
				The French philosopher Jean-Jacques Rousseau first introduced this game in "A Discourse on
				Inequality" in 1755. The game illustrates the conflict between social cooperation and
				indidivual benefit.
			</p>

			<h3 class="mt-4">Formal definition (2 players)</h3>
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

			<h3 class="mt-4">Stag 🦌</h3>
			<p class="mt-2">
				To capture the stag, you must call <code>huntStag</code> and more than
				<b>51% of the supply need to be "mature trees"</b> i.e. they have the maximum segments level
				(acquired by transfers).
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
			</ul>
			<h3 class="mt-4">Hare 🐰</h3>
			<p class="mt-4">
				To capture a hare, you must call <code>huntHare</code> and pay a fee (increasing with supply
				and after each hare).
			</p>
			<h4 class="mt-2">Reward & consequences:</h4>
			<ul class="list-disc list-inside mt-2">
				<li>Your tree gets <code>animated</code> trait until the next stag hunt</li>
				<li><b>A new cloned NFT</b> with lower value traits.</li>
				<li>You trigger decline for everyone for 211810 blocks</li>
				<li>Your tree is excluded from cooperation count for 211810 blocks</li>
				<li>The 'hares' trait is incremented.</li>
			</ul>
			<br />
		</Toggle>
	</div>
	<div class="faq__list__item">
		<Toggle question="Why Trees and what is 'The Merge' ?">
			<p>
				<b>Trees</b> can be found everywhere in the world and are essential for our environment.
				They are living beings and used in many civilizations as a symbol for life.
				<br />
				The Merge Trees want to represent the life happening on the Ethereum blockchain through blocks,
				events, logs (...) and the community behind it.
				<br />
				As The Merge has been successfully accomplished, it also shows that global coordination on complex
				issues is possible.
				<br />
				<br />
				<b>The Merge</b> is an upgrade of the Ethereum blockchain that switched from Proof of Work
				to Proof of Stake consensus.<br /> This eliminated the need for energy-intensive mining, and
				instead secures the network using staked ether.<br /> You can find out more
				<a
					href="https://ethereum.org/en/upgrades/merge/"
					rel="external noopener noreferrer"
					target="_blank">The Merge</a
				>
			</p>
		</Toggle>
	</div>
	<div class="faq__list__item">
		<Toggle question="On-chain artwork">
			MergeTrees are stored fully onchain on Ethereum and do not host the images files nor metadata
			on other network like IPFS or Arweave.
			<br /> <br />
			From the tree's traits, all the branches characteristics are computed and put together to draw
			the entire tree. Once it is ready, the resulting SVG is encoded in base64.
			<br /><br />
			<h3>Rendering</h3>
			Rendering trees on-chain wasn't easy, but it's real now. A first approach involved doing a lot
			of maths in Solidity to calculate each branch position. But there were a lot of limitations about
			the tree parameters.
			<br />
			So after some research, I decided to leverage the power of
			<a href="https://www.w3.org/TR/SVG2/">SVG</a>
			and its
			<a
				href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use"
				rel="external noopener noreferrer"
				target="_blank">&lt;use href &gt;</a
			>
			, which allow to re-use parts of a document. For the tree, each branch is drawn by reusing the
			previous one and scaling/rotating it.
			<br />
			That's how it is stored on-chain and for old computers why you can experience some slowness (especially
			on animated one, but hey see it as an homage to PoW 😉️).
			<br />
			<br />
			A detailed article will be published soon.
		</Toggle>
	</div>
	<div class="faq__list__item">
		<Toggle question="Artwork evolution">
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
				phase or decline otherwise. A growthDivider is also set to tweak it more precisely.
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

			<br />
			<br />
			<h3>Colors 🎨</h3>
			Since we all share the same planet but have a highly unequal impact on it, certain MergeTrees have
			the unique ability to alter 1 bit of the color across ALL trees.
			<br /> If they manage to reach consensus, they might be able to turn the trees and their
			markers to
			<span class="text-red-500">red</span>, <span class="text-blue-500">blue</span> or
			<span class="text-yellow-500">yellow</span>
			(...).
		</Toggle>
	</div>
	<div class="faq__list__item">
		<Toggle question="MergeTree Traits">
			MergeTrees are generated pseudo-randomly based Ethereum block hashes and have the following
			traits:
			<br />
			<ul class="list-disc list-inside mt-2">
				<li><b>Length</b>: between 20 and 227</li>
				<li><b>Diameter</b>: between 5 and 40</li>
				<li>
					<b>D</b>: Fractal dimension (Hausdorff), between 2 and 3 (stored as an index of
					precomputed values)
				</li>
				<li>
					<b>Δ</b>: Leonardo da Vinci's exponent, between 1.93 and 2.3 (stored as an index of
					precomputed values)
				</li>
				<li><b>Angle</b>: (20°, 30°, 45°, 60°, 90°)</li>
				<li><b>Branches</b>: (2, 3, 4)</li>
				<li>
					<b>Animated</b>: if the tree growth or decline is animated each 12 seconds (PoS block
					time)
				</li>
			</ul>
			<br />
			You can build your own tree in the <a href="/playground">Playground</a>.
		</Toggle>
	</div>
	<div class="faq__list__item">
		<Toggle question="Seeder contract">
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
				<a
					href="https://eips.ethereum.org/EIPS/eip-4399#security-considerations"
					rel="external noopener noreferrer"
					target="_blank">Security considerations of EIP-4399</a
				>.
			</p>
		</Toggle>
	</div>
	<!-- <div class="faq__list__item">
		<Toggle question="MergeTrees DAO & Governance">
			<p><i>Work in Progress</i></p>
			<br />
		</Toggle>
	</div> -->
	<div class="faq__list__item">
		<Toggle question="Team/Artist">
			I (<a href="https://twitter.com/agraignic" rel="external noopener noreferrer" target="_blank">
				agraignic.eth
			</a>) am the creator of this project and the only team member for now !
			<br /> While doing some research about on-chain NFT possibilities, I felt in love with trees
			and their digital modeling. And plan to go way further than trees :)
			<br />
			<a href="https://discord.gg/puHyJy6vh5" rel="external noopener noreferrer" target="_blank">
				Join the team
			</a>
			<br />
			PS: You might find references of this project back in 2022. Yep this is a side project that was
			kept in a folder for months/years.<br />
			But I finally decided to launch it as is, by simplifying parts of it and adding the stag hunt game.
		</Toggle>
	</div>
	<div class="faq__list__item">
		<Toggle question="License & Composability">
			The artworks are licensed in <a
				href="https://creativecommons.org/licenses/by/4.0/"
				rel="external noopener noreferrer"
				target="_blank">CC BY</a
			>
			and the code in
			<a
				href="https://www.gnu.org/licenses/gpl-3.0.html"
				rel="external noopener noreferrer"
				target="_blank">GPL-3.0</a
			>.
			<br />
			<br />Composability with others artworks can be explored thanks to the
			<a
				href="https://eips.ethereum.org/EIPS/eip-4883"
				rel="external noopener noreferrer"
				target="_blank">EIP-4883</a
			>
			compliance.
			<br />
			<br />
			<p>Disclaimer: You are using this site and contracts at your own risk.</p>
		</Toggle>
	</div>
</div>

<style lang="postcss">
	.faq__list__item {
		@apply py-5;
		border-bottom: 1px dotted gray;
	}

	.faq__list__item:last-child {
		border-bottom: none;
	}

	a {
		@apply underline;
	}
</style>
