import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export function GET() {
	return json({ ok: true, service: 'cargosettle', databaseConfigured: Boolean(env.DATABASE_URL) });
}
