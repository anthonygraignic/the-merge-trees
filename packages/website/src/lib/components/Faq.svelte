<script>
	import Toggle from './Toggle.svelte';
</script>

<div class="flex flex-col pt-4 px-4 lg:px-10 max-w-5xl lg:w-[64rem]">
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
			You can preview your tree in the <a href="/playground">Playground</a>.
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
