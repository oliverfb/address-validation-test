import { GoogleValidationResult } from '../services/googleTypes.js';

export type DeliverabilityIssue =
  | 'DPV_NOT_CONFIRMED'
  | 'MISSING_SECONDARY'
  | 'UNCONFIRMED_COMPONENTS'
  | 'INSUFFICIENT_ADDRESS'
  | 'NON_US_ADDRESS';

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

