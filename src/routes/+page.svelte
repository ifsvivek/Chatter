<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';

	let visible = false;
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
		visible = true;
	});
</script>

<div class="animated-bg min-h-screen p-8">
	<div class="particles"></div>
	<div class="glow"></div>
	<div class="mx-auto max-w-6xl" in:fade={{ duration: 1000 }}>
		<header class="relative z-10 mb-16 text-center">
			<h1
				class="mb-4 bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent"
			>
				Chatter
			</h1>
			<div class="mx-auto max-w-2xl space-y-4">
				<p
					class="text-lg font-medium text-emerald-200/80"
					in:fly={{ y: 20, duration: 1000, delay: 500 }}
				>
					Select your character to begin the adventure
				</p>
				<p class="text-sm text-emerald-200/60" in:fly={{ y: 20, duration: 1000, delay: 700 }}>
					Join our magical realm where characters from different worlds come together to chat, share
					stories, and forge new friendships.
				</p>
				<div
					class="mt-6 flex flex-wrap justify-center gap-4 text-sm text-emerald-200/70"
					in:fly={{ y: 20, duration: 1000, delay: 900 }}
				>
					<div class="flex items-center gap-2">
						<span>✨</span>
						<span>Real-time Chat</span>
					</div>
					<div class="flex items-center gap-2">
						<span>↩️</span>
						<span>Message Replies</span>
					</div>
					<div class="flex items-center gap-2">
						<span>😊</span>
						<span>Emoji Reactions</span>
					</div>
				</div>
			</div>
		</header>

		<div class="relative z-10 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
			{#if visible}
				{#each characters as character, i}
					<button
						in:fly={{ y: 20, duration: 600, delay: 150 * i }}
						on:click={() => selectCharacter(character)}
						class="float-animation group relative overflow-hidden rounded-xl border border-emerald-500/10 bg-gray-800/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-gray-800/50 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] focus:outline-none"
					>
						<div
							class="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						></div>
						<div class="relative">
							<div
								class="mb-4 transform text-5xl transition-all duration-300 group-hover:scale-110 group-hover:animate-pulse"
							>
								{character.avatar}
							</div>
							<h2
								class="text-base font-medium text-emerald-100/90 transition-colors group-hover:text-emerald-200"
							>
								{character.name}
							</h2>
						</div>
					</button>
				{/each}
			{/if}
		</div>

		<footer class="relative z-10 mt-16 text-center">
			<p class="text-sm text-emerald-200/40">
				Built with SvelteKit, Neon Database, and a sprinkle of magic ✨
			</p>
		</footer>
	</div>
</div>

<style>
	.animated-bg {
		background: linear-gradient(-45deg, #1a2e35, #1f3b32, #2c4a3e, #1a2e35);
		background-size: 400% 400%;
		animation: gradient 15s ease infinite;
		position: relative;
		overflow: hidden;
	}

	.particles {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: radial-gradient(circle, rgba(16, 185, 129, 0.1) 1px, transparent 1px),
			radial-gradient(circle, rgba(16, 185, 129, 0.1) 1px, transparent 1px);
		background-size: 50px 50px;
		background-position:
			0 0,
			25px 25px;
		animation: particles 4s linear infinite;
		pointer-events: none;
	}

	.glow {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 600px;
		height: 600px;
		transform: translate(-50%, -50%);
		background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
		pointer-events: none;
		animation: glow 10s ease infinite;
	}

	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	@keyframes particles {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-50px);
		}
	}

	@keyframes glow {
		0%,
		100% {
			opacity: 0.5;
		}
		50% {
			opacity: 0.8;
		}
	}

	.float-animation {
		animation: float 6s ease-in-out infinite;
	}

	@keyframes float {
		0% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
		100% {
			transform: translateY(0px);
		}
	}
</style>
