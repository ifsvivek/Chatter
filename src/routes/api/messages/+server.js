// src/routes/api/messages/+server.js
import { sql } from '$lib/db';
import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        const messages = await sql`
            SELECT * FROM GlobalChat
            ORDER BY id DESC
            LIMIT 50
        `;
        return json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST({ request }) {
    const { username, message, replied_to } = await request.json();
    try {
        const [newMessage] = await sql`
            INSERT INTO GlobalChat (username, message, replied_to, reactions)
            VALUES (${username}, ${message}, ${replied_to}, '{}')
            RETURNING *
        `;
        return json(newMessage);
    } catch (error) {
        console.error('Error posting message:', error);
        return json({ error: 'Failed to post message' }, { status: 500 });
    }
}