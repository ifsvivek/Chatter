<!-- src/routes/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

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

	onMount(() => {
		const storedCharacter = localStorage.getItem('selectedCharacter');
		if (storedCharacter) {
			goto('/chat');
		}
	});
</script>

<main class="container mx-auto p-4">
	<h1 class="text-3xl font-bold mb-6">Choose Your Character</h1>
	<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
		{#each characters as character}
			<button
				class="p-4 bg-gray-100 rounded-lg shadow hover:shadow-md transition-shadow"
				on:click={() => selectCharacter(character)}
			>
				<div class="text-4xl mb-2">{character.avatar}</div>
				<div class="font-semibold">{character.name}</div>
			</button>
		{/each}
	</div>
</main>
