// src/routes/api/messages/+server.js
import { pool } from '$lib/db';
import { json } from '@sveltejs/kit';

export async function GET() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
      SELECT * FROM GlobalChat
      ORDER BY id DESC
      LIMIT 50
    `);
        return json(result.rows);
    } finally {
        client.release();
    }
}

export async function POST({ request }) {
    const { username, message, replied_to } = await request.json();
    const client = await pool.connect();
    try {
        const result = await client.query(`
      INSERT INTO GlobalChat (username, message, replied_to, reactions)
      VALUES ($1, $2, $3, '{}')
      RETURNING *
    `, [username, message, replied_to]);
        return json(result.rows[0]);
    } finally {
        client.release();
    }
}