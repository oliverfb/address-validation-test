export interface GoogleAddressValidationResponse {
  result?: GoogleValidationResult;
}

export interface GoogleValidationResult {
  verdict?: GoogleVerdict;
  address?: GoogleAddress;
  uspsData?: GoogleUspsData;
  metadata?: GoogleMetadata;
}

export interface GoogleVerdict {
  inputGranularity?: string;
  validationGranularity?: string;
  geocodeGranularity?: string;
  addressComplete?: boolean;
  hasUnconfirmedComponents?: boolean;
  hasInferredComponents?: boolean;
  hasReplacedComponents?: boolean;
}

export interface GoogleAddress {
  formattedAddress?: string;
  postalAddress?: PostalAddress;
  addressComponents?: AddressComponent[];
}

export interface PostalAddress {
  regionCode?: string;
  postalCode?: string;
  administrativeArea?: string;
  locality?: string;
  addressLines?: string[];
}

export interface AddressComponent {
  componentName?: {
    text?: string;
  };
  componentType?: string;
  confirmationLevel?: string;
}

export interface GoogleUspsData {
  dpvConfirmation?: string;
  dpvFootnotes?: string;
  dpvCmra?: boolean;
  dpvVacant?: boolean;
  dpvNoStat?: boolean;
  dpvThrowback?: boolean;
  postOfficeCity?: string;
  postOfficeState?: string;
  standardCarrierRoute?: string;
  deliveryPointCode?: string;
  deliveryPointCheckDigit?: string;
  addressRecordType?: string;
  ewsNoMatch?: boolean;
  defaultAddress?: boolean;
  lacsIndicator?: string;
  lacsReturnCode?: string;
  vacant?: boolean;
}

export interface GoogleMetadata {
  business?: boolean;
  poBox?: boolean;
  residential?: boolean;
}
