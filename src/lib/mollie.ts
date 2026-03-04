import { createMollieClient } from '@mollie/api-client';

const mollieApiKey = process.env.MOLLIE_API_KEY || '';

export const mollieClient = createMollieClient({ apiKey: mollieApiKey });
