// src/routes/api/messages/[id]/+server.js
import { sql } from '$lib/db';
import { json } from '@sveltejs/kit';

export async function DELETE({ params }) {
    const { id } = params;
    try {
        await sql`
      DELETE FROM GlobalChat
      WHERE id = ${id}::int
    `;
        return json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        return json({ error: 'Failed to delete message' }, { status: 500 });
    }
}