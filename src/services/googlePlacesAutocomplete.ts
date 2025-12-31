import axios from 'axios';
import {
  GooglePlacesAutocompleteResponse,
} from '../types/googlePlaces.js';

const PLACES_AUTOCOMPLETE_ENDPOINT =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';

// Fetch address suggestions from Google Places Autocomplete.
// Fail-open: returns [] on any error or missing config.
export async function getAddressSuggestions(input: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];
  if (!input?.trim()) return [];

  try {
    const response = await axios.get<GooglePlacesAutocompleteResponse>(
      PLACES_AUTOCOMPLETE_ENDPOINT,
      {
        params: {
          input,
          types: 'address',
          components: 'country:us',
          key: apiKey,
        },
        timeout: 3000,
      },
    );

    console.log('\nGOOGLE PLACES AUTOCOMPLETE RESPONSE', response.data);

    const predictions = response.data?.predictions ?? [];
    return predictions
      .map((prediction) => {
        const description =
          prediction.description ||
          prediction.structured_formatting?.main_text ||
          '';
        const placeId = prediction.place_id ?? '';
        if (!description || !placeId) return undefined;

        return description;
      })
      .filter((p): p is string => Boolean(p));
  } catch {
    return [];
  }
}
