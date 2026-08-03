import { json } from '@sveltejs/kit';
import { AuthInputError } from './input';
import { AuthServiceError } from './service';

export function authErrorResponse(error: unknown) {
	if (error instanceof AuthInputError || error instanceof AuthServiceError) {
		return json({ error: error.message }, { status: error.status });
	}
	if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
		return json({ error: error.message }, { status: error.status });
	}

	if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
		return json({ error: 'That account or workspace already exists' }, { status: 409 });
	}

	return json({ error: 'Unable to complete the authentication request' }, { status: 500 });
}
