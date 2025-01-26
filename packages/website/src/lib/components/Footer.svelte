<script lang="ts">
	import { PUBLIC_EXPLORER_URL, PUBLIC_MERGETREES_CONTRACT_ADDRESS } from '$env/static/public';
</script>

<footer class="container m-auto p-4 bg-white sm:p-6 dark:bg-gray-800">
	<div class="sm:flex sm:items-center sm:justify-between">
		<span>
			<p>
				An experiment by
				<a href="https://x.com/agraignic" rel="external noopener noreferrer" target="_blank">
					agraignic.eth
				</a>
			</p>
		</span>
		<div class="flex mt-4 space-x-6 sm:justify-center sm:mt-0 text-sm">
			<a
				href="https://discord.gg/xYku22QttF"
				rel="external noopener noreferrer"
				target="_blank"
				class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
			>
				Discord
			</a>
			<a
				href="https://github.com/anthonygraignic/the-merge-trees"
				rel="external noopener noreferrer"
				target="_blank"
				class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
			>
				Github
			</a>
			<!-- <a
				href="https://x.com/themergetrees"
				rel="external noopener noreferrer"
				target="_blank"
				class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
			>
				Twitter
			</a> -->
			<a
				href="{PUBLIC_EXPLORER_URL}/address/{PUBLIC_MERGETREES_CONTRACT_ADDRESS}#code"
				rel="external noopener noreferrer"
				target="_blank"
				class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
			>
				Contract
			</a>
		</div>
	</div>
</footer>

<style lang="postcss">
	span {
		@apply text-sm text-gray-500 sm:text-center dark:text-gray-400;
		@apply flex flex-col sm:flex-row;
	}
	a:hover {
		@apply underline;
	}
</style>
