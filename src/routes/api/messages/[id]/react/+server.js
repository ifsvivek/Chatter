// src/routes/api/messages/[id]/react/+server.js
import { sql } from '$lib/db';
import { json } from '@sveltejs/kit';

export async function POST({ params, request }) {
    const { id } = params;
    const { emoji } = await request.json();
    try {
        const [updatedMessage] = await sql`
            UPDATE GlobalChat
            SET reactions = COALESCE(reactions, '{}'::jsonb) || jsonb_build_object(${emoji}::text, COALESCE((reactions->${emoji}::text)::int, 0) + 1)
            WHERE id = ${id}::int
            RETURNING *
        `;
        return json(updatedMessage);
    } catch (error) {
        console.error('Error adding reaction:', error);
        return json({ error: 'Failed to add reaction' }, { status: 500 });
    }
}