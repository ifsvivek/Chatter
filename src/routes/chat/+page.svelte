<!-- src/routes/chat/+page.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { darkMode } from '$lib/stores';

	let messages = [];
	let newMessage = '';
	let selectedCharacter;
	let replyingTo = null;
	let chatContainer;
	let showReactions = null;

	const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

	function toggleDarkMode() {
		darkMode.update((n) => !n);
		localStorage.setItem('darkMode', JSON.stringify(!$darkMode));
		if ($darkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	function logout() {
		localStorage.removeItem('selectedCharacter');
		goto('/');
	}

	onMount(async () => {
		selectedCharacter = JSON.parse(localStorage.getItem('selectedCharacter'));
		if (!selectedCharacter) {
			goto('/');
			return;
		}

		const storedDarkMode = localStorage.getItem('darkMode');
		if (storedDarkMode) {
			darkMode.set(JSON.parse(storedDarkMode));
		}
		if ($darkMode) {
			document.documentElement.classList.add('dark');
		}

		await fetchMessages();
		const interval = setInterval(fetchMessages, 5000);

		return () => clearInterval(interval);
	});

	async function fetchMessages() {
		try {
			const response = await fetch('/api/messages');
			if (!response.ok) {
				throw new Error('Failed to fetch messages');
			}
			const data = await response.json();
			messages = data
				.map((message) => ({
					...message,
					username:
						typeof message.username === 'string' ? JSON.parse(message.username) : message.username,
					reactions: message.reactions || {}
				}))
				.reverse();
			scrollToBottom();
		} catch (error) {
			console.error('Error fetching messages:', error);
		}
	}

	async function sendMessage() {
		if (!newMessage.trim()) return;

		const messageData = {
			username: JSON.stringify(selectedCharacter),
			message: newMessage,
			replied_to: replyingTo
		};

		try {
			const response = await fetch('/api/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(messageData)
			});

			if (!response.ok) {
				throw new Error('Failed to send message');
			}

			newMessage = '';
			replyingTo = null;
			await fetchMessages();
		} catch (error) {
			console.error('Error sending message:', error);
		}
	}

	async function addReaction(messageId, emoji) {
		try {
			const response = await fetch(`/api/messages/${messageId}/react`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ emoji })
			});

			if (!response.ok) {
				throw new Error('Failed to add reaction');
			}

			await fetchMessages();
		} catch (error) {
			console.error('Error adding reaction:', error);
		}
		showReactions = null;
	}

	async function deleteMessage(messageId) {
		try {
			const response = await fetch(`/api/messages/${messageId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete message');
			}

			await fetchMessages();
		} catch (error) {
			console.error('Error deleting message:', error);
		}
	}

	function setReplyTo(messageId) {
		replyingTo = messageId;
	}

	function cancelReply() {
		replyingTo = null;
	}

	function scrollToBottom() {
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}

	function toggleReactions(messageId) {
		showReactions = showReactions === messageId ? null : messageId;
	}
</script>

<main class="min-h-screen bg-white dark:bg-black transition-colors duration-300">
	<div class="container mx-auto p-4 flex flex-col h-screen">
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Chatter</h1>
			<div class="flex items-center space-x-2">
				<button
					on:click={logout}
					class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
				>
					Logout
				</button>
				<button
					on:click={toggleDarkMode}
					class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
				>
					{$darkMode ? '☀️' : '🌙'}
				</button>
			</div>
		</div>
		<div class="mb-4 text-gray-800 dark:text-white">
			Logged in as: {selectedCharacter?.avatar}
			{selectedCharacter?.name}
		</div>

		<div
			class="bg-gray-100 dark:bg-black p-4 rounded-lg flex-grow overflow-y-auto mb-4"
			bind:this={chatContainer}
		>
			{#each messages as message (message.id)}
				<div class="mb-4 p-2 bg-white dark:bg-gray-700 rounded shadow relative">
					<div class="flex justify-between items-start">
						<div>
							{#if message.username}
								<div class="flex items-center mb-2">
									<span class="text-2xl mr-2">{message.username.avatar}</span>
									<span class="font-semibold text-gray-800 dark:text-white"
										>{message.username.name}</span
									>
								</div>
							{/if}
							{#if message.replied_to}
								<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
									Replying to: {messages.find((m) => m.id === message.replied_to)?.message}
								</div>
							{/if}
							<p class="text-gray-800 dark:text-white">{message.message}</p>
						</div>
						{#if message.username.name === selectedCharacter.name}
							<button
								on:click={() => deleteMessage(message.id)}
								class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
							>
								🗑️
							</button>
						{/if}
					</div>
					<div class="mt-2 flex items-center">
						<button
							class="text-sm text-gray-600 dark:text-gray-300 mr-2"
							on:click={() => toggleReactions(message.id)}
						>
							Add Reaction
						</button>
						{#if showReactions === message.id}
							<div
								class="absolute bottom-full left-0 bg-white dark:bg-gray-600 p-2 rounded shadow-lg"
							>
								{#each emojis as emoji}
									<button class="mr-2" on:click={() => addReaction(message.id, emoji)}>
										{emoji}
									</button>
								{/each}
							</div>
						{/if}
						{#each Object.entries(message.reactions) as [emoji, count]}
							<span class="mr-2 text-sm">{emoji} {count}</span>
						{/each}
						<button
							class="text-sm text-gray-600 dark:text-gray-300"
							on:click={() => setReplyTo(message.id)}
						>
							Reply
						</button>
					</div>
				</div>
			{/each}
		</div>

		<form on:submit|preventDefault={sendMessage} class="flex items-center">
			{#if replyingTo}
				<div class="mr-2 text-sm text-gray-500 dark:text-gray-400">
					Replying to: {messages.find((m) => m.id === replyingTo)?.message}
					<button class="ml-2 text-red-500 dark:text-red-400" on:click={cancelReply}>Cancel</button>
				</div>
			{/if}
			<input
				type="text"
				bind:value={newMessage}
				placeholder="Type your message..."
				class="flex-grow p-2 border rounded-l bg-white dark:bg-black text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
			/>
			<button
				type="submit"
				class="p-2 bg-black dark:bg-gray-200 text-white dark:text-gray-800 rounded-r"
				>Send</button
			>
		</form>
	</div>
</main>
