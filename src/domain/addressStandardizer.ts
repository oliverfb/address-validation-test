import { GoogleValidationResult } from '../services/googleTypes.js';

export interface StandardizedAddress {
  number?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  zipPlus4?: string;
}

// Helper to pull a specific component type (e.g., route, street_number) from Google response.
function findComponent(result: GoogleValidationResult, componentType: string): string | undefined {
  const components = result.address?.addressComponents;
  if (!components) return undefined;

  const match = components.find((component) => component.componentType === componentType);
  return match?.componentName?.text;
}

// Derive street name + suffix, preferring structured component over raw line.
function deriveStreet(result: GoogleValidationResult): string | undefined {
  const route = findComponent(result, 'route');
  if (route) return route;

  const addressLine = result.address?.postalAddress?.addressLines?.[0];
  return addressLine;
}

// Derive primary number from structured component or first token of the address line.
function deriveNumber(result: GoogleValidationResult): string | undefined {
  const streetNumber = findComponent(result, 'street_number');
  if (streetNumber) return streetNumber;

  const addressLine = result.address?.postalAddress?.addressLines?.[0];
  if (!addressLine) return undefined;

  const firstToken = addressLine.split(' ')[0];
  return firstToken?.match(/^\d+/) ? firstToken : undefined;
}


// Convert Google validation result into our standardized address shape (number/street/city/state/zip).
export function standardizeAddress(result: GoogleValidationResult): StandardizedAddress {
  const postal = result.address?.postalAddress;
  const postalCode = postal?.postalCode;

  let zip: string | undefined;
  let zipPlus4: string | undefined;

  if (postalCode) {
    if (postalCode.includes('-')) {
      const [base, plus4] = postalCode.split('-');
      zip = base;
      zipPlus4 = plus4 ? `${base}-${plus4}` : postalCode;
    } else if (postalCode.length > 5) {
      zip = postalCode.slice(0, 5);
      const plus4 = postalCode.slice(5);
      zipPlus4 = plus4 ? `${zip}-${plus4}` : undefined;
    } else {
      zip = postalCode;
    }
  }

  return {
    number: deriveNumber(result),
    street: deriveStreet(result),
    city: postal?.locality,
    state: postal?.administrativeArea,
    zip: zip,
    zipPlus4: zipPlus4,
  };
}

