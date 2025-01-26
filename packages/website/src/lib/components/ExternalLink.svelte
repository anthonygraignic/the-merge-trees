<script lang="ts">
	export let href;
	export let newTab = true;
</script>

<a
	{href}
	rel="external nofollow noreferrer"
	target={newTab ? '_blank' : '_self'}
	class="underline inline-flex text-center items-center"
>
	<slot></slot>
	<img
		src="/images/icons/external-link.svg"
		alt="Link to external website"
		class="dark:invert w-5"
	/>
</a>
