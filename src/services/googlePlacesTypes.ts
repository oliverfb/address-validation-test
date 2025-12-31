export interface GooglePlacesAutocompletePrediction {
  description?: string;
  place_id?: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
}

export interface GooglePlacesAutocompleteResponse {
  predictions?: GooglePlacesAutocompletePrediction[];
  status?: string;
  error_message?: string;
}
