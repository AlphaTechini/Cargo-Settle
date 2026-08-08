import type { BusinessRole } from './types';

const businessRoles = new Set<BusinessRole>(['shipper', 'freight_forwarder', 'logistics_partner']);

export class AuthInputError extends Error {
	status = 400;
}

export type RegistrationInput = {
	email: string;
	password: string;
	displayName: string;
	workspaceName: string;
	businessRole: BusinessRole;
};

export type LoginInput = {
	email: string;
	password: string;
	rememberMe: boolean;
};

function stringField(value: unknown, field: string) {
	if (typeof value !== 'string' || value.trim().length === 0) {
		throw new AuthInputError(`${field} is required`);
	}
	return value.trim();
}

export function parseRegistrationInput(value: unknown): RegistrationInput {
	if (!value || typeof value !== 'object')
		throw new AuthInputError('Request body must be an object');
	const body = value as Record<string, unknown>;
	const email = stringField(body.email, 'email').toLowerCase();
	const password = stringField(body.password, 'password');
	const displayName = stringField(body.displayName, 'displayName');
	const workspaceName = typeof body.workspaceName === 'string' ? body.workspaceName.trim() : '';
	const businessRole = stringField(body.businessRole, 'businessRole') as BusinessRole;

	if (!email.includes('@') || email.length > 320) throw new AuthInputError('email is invalid');
	if (password.length < 8 || password.length > 128) {
		throw new AuthInputError('password must be between 8 and 128 characters');
	}
	if (!businessRoles.has(businessRole)) throw new AuthInputError('businessRole is invalid');
	if (businessRole === 'freight_forwarder' && workspaceName.length === 0) {
		throw new AuthInputError('workspaceName is required for freight forwarders');
	}

	return { email, password, displayName, workspaceName, businessRole };
}

export function parseLoginInput(value: unknown): LoginInput {
	if (!value || typeof value !== 'object')
		throw new AuthInputError('Request body must be an object');
	const body = value as Record<string, unknown>;
	return {
		email: stringField(body.email, 'email').toLowerCase(),
		password: stringField(body.password, 'password'),
		rememberMe: body.rememberMe !== false
	};
}
