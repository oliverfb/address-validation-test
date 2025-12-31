import { z } from 'zod';

// Free-form address text (plain text body), trimmed and required.
export const validateAddressRequestSchema = z.string().trim().min(1, 'address is required');

