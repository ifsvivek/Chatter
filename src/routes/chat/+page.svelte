<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';

	let messages = [];
	let newMessage = '';
	let selectedCharacter;
	let replyingTo = null;
	let chatContainer;
	let showReactions = null;

	const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

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

<div
	class="flex h-[100dvh] flex-col bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 md:flex-row"
>
	<!-- Sidebar/Header - More compact on mobile -->
	<div
		class="flex h-auto flex-shrink-0 flex-col border-b border-emerald-500/10 bg-gray-900/30 backdrop-blur-md md:h-screen md:w-72 md:border-r"
	>
		<div class="p-3 md:p-6">
			<div class="flex items-center justify-between md:block">
				<h1
					class="bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-xl font-bold text-transparent md:mb-6 md:text-3xl"
				>
					Chatter
				</h1>

				<!-- Mobile collapsible user info -->
				<details class="relative md:hidden">
					<summary class="cursor-pointer list-none text-emerald-200/70">
						<span class="text-lg">{selectedCharacter?.avatar}</span>
					</summary>
					<div
						class="absolute right-0 top-full mt-1 w-48 rounded-lg border border-emerald-500/20 bg-gray-900/95 p-3 shadow-lg"
					>
						<span class="text-sm font-medium text-emerald-100">{selectedCharacter?.name}</span>
					</div>
				</details>

				<!-- Desktop user info -->
				<div
					class="hidden rounded-xl border border-emerald-500/20 bg-emerald-600/10 p-4 backdrop-blur-sm md:block"
				>
					<p class="mb-2 text-sm text-emerald-200/70">Logged in as:</p>
					<div class="flex items-center">
						<span class="mr-3 text-3xl">{selectedCharacter?.avatar}</span>
						<span class="font-medium text-emerald-100">{selectedCharacter?.name}</span>
					</div>
				</div>
			</div>
		</div>
		<button
			on:click={logout}
			class="mx-3 mb-3 mt-auto rounded-lg bg-red-500/80 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition-all hover:bg-red-500 md:mx-6 md:mb-6 md:px-4 md:py-2 md:text-base"
		>
			Logout
		</button>
	</div>

	<!-- Chat Area - Improved mobile layout -->
	<div class="flex flex-1 flex-col bg-gray-900/30 backdrop-blur-md">
		<div
			class="flex-1 overflow-y-auto overscroll-contain p-3 md:p-6"
			bind:this={chatContainer}
			style="height: calc(100dvh - 140px);"
		>
			{#each messages as message (message.id)}
				<div class="mb-3 last:mb-1 md:mb-6">
					<div class="mb-1 flex items-center md:mb-2">
						<span class="mr-2 text-lg md:text-2xl">{message.username.avatar}</span>
						<span class="text-xs font-medium text-emerald-100 md:text-base"
							>{message.username.name}</span
						>
					</div>
					<div
						class="ml-4 rounded-xl border border-emerald-500/10 bg-gray-800/50 p-2.5 backdrop-blur-sm md:ml-9 md:p-4"
					>
						{#if message.replied_to}
							<div class="mb-1.5 text-xs text-emerald-200/60 md:mb-2 md:text-sm">
								↳ {messages.find((m) => m.id === message.replied_to)?.message}
							</div>
						{/if}
						<p class="text-xs text-emerald-100 md:text-base">{message.message}</p>

						<!-- Message Actions - Compact on mobile -->
						<div
							class="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-emerald-200/60 md:mt-3 md:text-sm"
						>
							<button
								class="transition-colors hover:text-emerald-200"
								on:click={() => toggleReactions(message.id)}
							>
								React
							</button>
							<button
								class="transition-colors hover:text-emerald-200"
								on:click={() => setReplyTo(message.id)}
							>
								Reply
							</button>
							{#if message.username.name === selectedCharacter.name}
								<button
									class="transition-colors hover:text-red-400"
									on:click={() => deleteMessage(message.id)}
								>
									Delete
								</button>
							{/if}
						</div>

						<!-- Rest of the components remain the same -->
					</div>
				</div>
			{/each}
		</div>

		<!-- Message Input - Better mobile handling -->
		<div class="border-t border-emerald-500/10 bg-gray-900/30 p-3 backdrop-blur-md md:p-6">
			{#if replyingTo}
				<div
					class="mb-2 flex items-center justify-between rounded-lg bg-emerald-500/5 px-2 py-1.5 md:mb-3 md:px-3 md:py-2"
				>
					<span class="text-xs text-emerald-200/70 md:text-sm">
						Replying to: {messages.find((m) => m.id === replyingTo)?.message}
					</span>
					<button class="text-xs text-red-400 hover:text-red-500 md:text-sm" on:click={cancelReply}>
						Cancel
					</button>
				</div>
			{/if}
			<form on:submit|preventDefault={sendMessage} class="flex gap-2 md:gap-3">
				<input
					type="text"
					bind:value={newMessage}
					placeholder="Type your message..."
					class="flex-1 rounded-lg border border-emerald-500/10 bg-gray-800/50 px-3 py-1.5 text-xs text-emerald-100 placeholder-emerald-200/30 focus:border-emerald-500/30 focus:outline-none md:py-2 md:text-base"
				/>
				<button
					type="submit"
					class="rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs text-white transition-all hover:bg-emerald-600 md:px-6 md:py-2 md:text-base"
				>
					Send
				</button>
			</form>
		</div>
	</div>
</div>
