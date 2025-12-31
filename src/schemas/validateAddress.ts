import { z } from 'zod';

export const validateAddressRequestSchema = z.object({
  address: z.string().trim().min(1, 'address is required'),
});

export type ValidateAddressRequest = z.infer<typeof validateAddressRequestSchema>;

