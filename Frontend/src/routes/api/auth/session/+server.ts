import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ locals }) => json({ user: locals.user });
