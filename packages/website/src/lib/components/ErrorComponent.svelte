<script>
	export let error;
</script>

{#if error}
	<div class="my-4 rounded-lg max-w-xl mx-auto">
		<p class="py-2 text-center text-red-600 dark:text-red-500 text-sm">
			{#if Object.keys(error).length > 0}
				{#if error.code || error.reason?.code}
					Code: {error.code ?? error.reason?.code ?? ''}
					<br />
				{/if}
				Message: {error.data?.message ??
					error.reason?.data?.message ??
					error.reason?.message ??
					error.message ??
					'Unknown error, check console 👩‍💻️'}
			{:else}
				<em>{error}</em>
			{/if}
		</p>
		<slot name="error" />
	</div>
{:else}
	<slot />
{/if}
