<!-- src/routes/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { darkMode } from '$lib/stores';

	let characters = [
		{ id: 1, name: 'Wizard', avatar: '🧙‍♂️' },
		{ id: 2, name: 'Knight', avatar: '🤺' },
		{ id: 3, name: 'Archer', avatar: '🏹' },
		{ id: 4, name: 'Mage', avatar: '🧝‍♀️' },
		{ id: 5, name: 'Rogue', avatar: '🥷' },
		{ id: 6, name: 'Healer', avatar: '🧚' },
		{ id: 7, name: 'Bard', avatar: '🎭' },
		{ id: 8, name: 'Druid', avatar: '🌿' },
		{ id: 9, name: 'Paladin', avatar: '🛡️' },
		{ id: 10, name: 'Necromancer', avatar: '💀' }
	];

	function selectCharacter(character) {
		localStorage.setItem('selectedCharacter', JSON.stringify(character));
		goto('/chat');
	}

	function toggleDarkMode() {
		darkMode.update((n) => !n);
		localStorage.setItem('darkMode', JSON.stringify(!$darkMode));
		if ($darkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	onMount(() => {
		const storedCharacter = localStorage.getItem('selectedCharacter');
		if (storedCharacter) {
			goto('/chat');
		}

		const storedDarkMode = localStorage.getItem('darkMode');
		if (storedDarkMode) {
			darkMode.set(JSON.parse(storedDarkMode));
		}
		if ($darkMode) {
			document.documentElement.classList.add('dark');
		}
	});
</script>

<main class="min-h-screen bg-white dark:bg-black transition-colors duration-300">
	<div class="container mx-auto p-4">
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Choose Your Character</h1>
			<button
				on:click={toggleDarkMode}
				class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
			>
				{$darkMode ? '☀️' : '🌙'}
			</button>
		</div>
		<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
			{#each characters as character}
				<button
					class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow text-gray-800 dark:text-white"
					on:click={() => selectCharacter(character)}
				>
					<div class="text-4xl mb-2">{character.avatar}</div>
					<div class="font-semibold">{character.name}</div>
				</button>
			{/each}
		</div>
	</div>
</main>
