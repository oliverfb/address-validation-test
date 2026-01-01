import axios from 'axios';
import {
  GoogleAddressValidationResponse,
  GoogleValidationResult,
} from '../types/googleAddressValidation.js';

const GOOGLE_ENDPOINT = 'https://addressvalidation.googleapis.com/v1:validateAddress';

export class GoogleAddressValidationError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

// Calls Google Address Validation API for a free-form US address and returns the parsed result.
export async function validateAddressWithGoogle(
  address: string,
): Promise<GoogleValidationResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new GoogleAddressValidationError('GOOGLE_MAPS_API_KEY is not set');
  }

  try {
    const response = await axios.post<GoogleAddressValidationResponse>(
      `${GOOGLE_ENDPOINT}?key=${apiKey}`,
      {
        address: {
          regionCode: 'US',
          addressLines: [address],
        },
      },
      {
        timeout: 5000,
        headers: {
          Referer: process.env.PROJECT_URL || '',
        },
      },
    );

    if (!response.data.result) {
      throw new GoogleAddressValidationError('Empty result from Google');
    }

    return response.data.result;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.error?.message || err.message;
      const status = err.response?.status;
      throw new GoogleAddressValidationError(message, status);
    }

    if (err instanceof Error) {
      throw new GoogleAddressValidationError(err.message);
    }

    throw new GoogleAddressValidationError('Unknown error contacting Google');
  }
}

