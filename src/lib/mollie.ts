import { createMollieClient } from '@mollie/api-client';

const mollieApiKey = process.env.MOLLIE_API_KEY || 'test_dummy_key_for_build_only';

export const mollieClient = createMollieClient({ apiKey: mollieApiKey });
