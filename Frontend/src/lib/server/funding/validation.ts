export type FundingCurrency = 'usdc' | 'eurc';

export type FundingRequestInput = {
	amount: string;
	currency: FundingCurrency;
};

export class FundingInputError extends Error {
	status = 400;
}

const amountPattern = /^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/;
const currencies = new Set<FundingCurrency>(['usdc', 'eurc']);

export function parseFundingRequest(value: unknown): FundingRequestInput {
	if (!value || typeof value !== 'object') {
		throw new FundingInputError('Funding request must be an object');
	}
	const body = value as Record<string, unknown>;
	if (typeof body.amount !== 'string' || !amountPattern.test(body.amount)) {
		throw new FundingInputError('Funding amount must be a positive decimal with up to 6 decimals');
	}
	if (Number(body.amount) <= 0) {
		throw new FundingInputError('Funding amount must be greater than zero');
	}
	if (typeof body.currency !== 'string' || !currencies.has(body.currency as FundingCurrency)) {
		throw new FundingInputError('Funding currency must be USDC or EURC');
	}
	return { amount: body.amount, currency: body.currency as FundingCurrency };
}
