<script lang="ts">
	import { onMount } from 'svelte';

	const DEFAULT_LABELS = {
		d: 'd',
		h: 'h',
		m: 'm',
		s: 's'
	};
	const DEFAULT_DISPLAY = {
		d: false,
		h: true,
		m: true,
		s: true
	};
	interface UnitProp<T> {
		d?: T;
		h?: T;
		m?: T;
		s?: T;
	}

	export let dateTimeISO8601Str: string;
	export let units = true;
	export let separator = '-';
	export let display: UnitProp<boolean> = DEFAULT_DISPLAY;
	export let labels: UnitProp<string> = DEFAULT_LABELS;
	let remainingTime: number = 0;
	let nextPhaseDateTime = Date.parse(dateTimeISO8601Str);

	const SECOND = 1000; // Milliseconds in 1 sec
	const MINUTE = SECOND * 60; // Seconds in 1 min
	const HOUR = MINUTE * 60; // Minutes in 1 hour
	const DAY = HOUR * 24; // Hours in 1 day

	$: days = Math.max(0, Math.floor(remainingTime / DAY));
	$: hours = Math.max(0, Math.floor((remainingTime % DAY) / HOUR));
	$: minutes = Math.max(0, Math.floor((remainingTime % HOUR) / MINUTE));
	$: seconds = Math.max(0, Math.floor((remainingTime % MINUTE) / SECOND));
	$: _labels = {
		...DEFAULT_LABELS,
		...labels
	};
	$: _display = {
		...DEFAULT_DISPLAY,
		...display
	};

	function pad(i: number) {
		return i.toString().padStart(2, '0');
	}

	onMount(() => {
		remainingTime = nextPhaseDateTime - new Date().getTime();
		setInterval(() => {
			remainingTime = nextPhaseDateTime - new Date().getTime();
		}, 1000);
	});
</script>

{#if remainingTime}
	<div class={$$props.class || 'flex flex-row'}>
		{#if _display.d}
			{#key days}
				<div class="flex justify-start">
					<span>{days ?? '???'}</span>
					<span>{units ? _labels.d : ''}</span>
				</div>
			{/key}
			{#if _display.h || _display.m || _display.s}
				<div>
					{separator}
				</div>
			{/if}
		{/if}
		{#if _display.h}
			{#key hours}
				<div class="flex justify-start">
					<span>{pad(hours) ?? '???'}</span>
					<span>{units ? _labels.h : ''}</span>
				</div>
			{/key}
			{#if _display.m || _display.s}
				<div>
					{separator}
				</div>
			{/if}
		{/if}
		{#if _display.m}
			{#key minutes}
				<div class="flex justify-start">
					<span>{pad(minutes) ?? '???'}</span>
					<span>{units ? _labels.m : ''}</span>
				</div>
			{/key}
			{#if _display.s}
				<div>
					{separator}
				</div>
			{/if}
		{/if}
		{#if _display.s}
			{#key seconds}
				<div class="flex justify-start">
					<span>{pad(seconds) ?? '???'}</span>
					<div>{units ? _labels.s : ''}</div>
				</div>
			{/key}
		{/if}
	</div>
{/if}
