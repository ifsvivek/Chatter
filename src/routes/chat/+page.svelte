<!-- src/routes/chat/+page.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';

	let messages = [];
	let newMessage = '';
	let selectedCharacter;
	let replyingTo = null;

	const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

	onMount(async () => {
		selectedCharacter = JSON.parse(localStorage.getItem('selectedCharacter'));
		if (!selectedCharacter) {
			goto('/');
			return;
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
			messages = data.map((message) => ({
				...message,
				username:
					typeof message.username === 'string' ? JSON.parse(message.username) : message.username
			}));
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
	}

	function setReplyTo(messageId) {
		replyingTo = messageId;
	}

	function cancelReply() {
		replyingTo = null;
	}
</script>

<main class="container mx-auto p-4">
	<h1 class="text-3xl font-bold mb-6">Global Chat Room</h1>
	<div class="mb-4">
		Logged in as: {selectedCharacter?.avatar}
		{selectedCharacter?.name}
	</div>

	<div class="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto mb-4">
		{#each messages as message (message.id)}
			<div class="mb-4 p-2 bg-white rounded shadow">
				{#if message.username}
					<div class="flex items-center mb-2">
						<span class="text-2xl mr-2">{message.username.avatar}</span>
						<span class="font-semibold">{message.username.name}</span>
					</div>
				{/if}
				{#if message.replied_to}
					<div class="text-sm text-gray-500 mb-1">
						Replying to: {messages.find((m) => m.id === message.replied_to)?.message}
					</div>
				{/if}
				<p>{message.message}</p>
				<div class="mt-2 flex items-center">
					{#each emojis as emoji}
						<button class="mr-2 text-sm" on:click={() => addReaction(message.id, emoji)}>
							{emoji}
							{message.reactions[emoji] || 0}
						</button>
					{/each}
					<button class="text-sm text-blue-500" on:click={() => setReplyTo(message.id)}>
						Reply
					</button>
				</div>
			</div>
		{/each}
	</div>

	<form on:submit|preventDefault={sendMessage} class="flex items-center">
		{#if replyingTo}
			<div class="mr-2 text-sm text-gray-500">
				Replying to: {messages.find((m) => m.id === replyingTo)?.message}
				<button class="ml-2 text-red-500" on:click={cancelReply}>Cancel</button>
			</div>
		{/if}
		<input
			type="text"
			bind:value={newMessage}
			placeholder="Type your message..."
			class="flex-grow p-2 border rounded-l"
		/>
		<button type="submit" class="p-2 bg-blue-500 text-white rounded-r">Send</button>
	</form>
</main>
