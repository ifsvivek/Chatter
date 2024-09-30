// src/lib/db.js
import { neon } from '@neondatabase/serverless';
import { POSTGRES_URL } from '$env/static/private';

export const sql = neon(POSTGRES_URL);