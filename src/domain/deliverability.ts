import { GoogleValidationResult } from '../types/googleAddressValidation.js';

export type DeliverabilityIssue =
  | 'DPV_NOT_CONFIRMED'      // DPV (Delivery Point Validation) could not confirm the address as valid/deliverable
  | 'MISSING_SECONDARY'      // Address likely requires secondary (apt/unit) information that's missing
  | 'UNCONFIRMED_COMPONENTS' // Some address components could not be confirmed as valid (e.g., street, city)
  | 'INSUFFICIENT_ADDRESS'   // Address is incomplete or missing required fields
  | 'NON_US_ADDRESS';        // Address is not in the United States

export interface DeliverabilityAssessment {
  isDeliverable: boolean;
  issues: DeliverabilityIssue[];
  missingSecondary: boolean;
  dpvConfirmation?: string;
  dpvFootnotes?: string;
}

// DPV codes S/D mean secondary info (apt/unit) is missing or required.
function isMissingSecondary(dpvConfirmation?: string): boolean {
  if (!dpvConfirmation) return false;
  return dpvConfirmation === 'S' || dpvConfirmation === 'D';
}

// Evaluate USPS-style deliverability from Google validation result and return issues + flags.
export function assessDeliverability(
  result: GoogleValidationResult,
): DeliverabilityAssessment {
  const issues: DeliverabilityIssue[] = [];
  const dpvConfirmation = result.uspsData?.dpvConfirmation;
  const dpvFootnotes = result.uspsData?.dpvFootnotes;

  const regionCode = result.address?.postalAddress?.regionCode?.toUpperCase();
  const regionCodeIsUs = !regionCode || regionCode === 'US';
  if (!regionCodeIsUs) issues.push('NON_US_ADDRESS');

  const missingSecondary = isMissingSecondary(dpvConfirmation);
  if (missingSecondary) {
    issues.push('MISSING_SECONDARY');
  }

  const hasUnconfirmed = result.verdict?.hasUnconfirmedComponents === true;
  if (hasUnconfirmed) issues.push('UNCONFIRMED_COMPONENTS');

  const addressComplete = result.verdict?.addressComplete;
  if (addressComplete === false) issues.push('INSUFFICIENT_ADDRESS');

  if (dpvConfirmation !== 'Y') {
    issues.push('DPV_NOT_CONFIRMED');
  }

  const isDeliverable =
    regionCodeIsUs &&
    dpvConfirmation === 'Y' &&
    !missingSecondary &&
    !hasUnconfirmed &&
    addressComplete !== false;

  return {
    isDeliverable,
    issues: isDeliverable ? [] : issues,
    missingSecondary,
    dpvConfirmation,
    dpvFootnotes,
  };
}

