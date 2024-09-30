// src/routes/api/messages/[id]/react/+server.js
import { pool } from '$lib/db';
import { json } from '@sveltejs/kit';

export async function POST({ params, request }) {
    const { id } = params;
    const { emoji } = await request.json();
    const client = await pool.connect();
    try {
        const result = await client.query(`
            UPDATE GlobalChat
            SET reactions = COALESCE(reactions, '{}'::jsonb) || jsonb_build_object($1, COALESCE((reactions->$1)::int, 0) + 1)
            WHERE id = $2
            RETURNING *
        `, [emoji, id]);
        return json(result.rows[0]);
    } catch (error) {
        console.error('Error adding reaction:', error);
        return json({ error: 'Failed to add reaction' }, { status: 500 });
    } finally {
        client.release();
    }
}