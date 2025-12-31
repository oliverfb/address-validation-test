# Property Address Validation API

Simple Fastify + TypeScript API exposing `POST /validate-address` for US address validation/standardization using Google Maps Platform Address Validation (USPS DPV-backed).

## Glossary of Terms
Please refer to the [GLOSSARY.md](GLOSSARY.md) file for a glossary of terms used in the project.

## How it works

The API:
1. Receives a request to validate an address.
2. Validates the address using the Google Maps Platform Address Validation API.
3. Standardizes the address using the Common Address Standardization System.
4. Assesses the deliverability of the address using the USPS Delivery Point Validation API.
5. Returns the result to the caller.

## File structure
- `src/server.ts` – Fastify bootstrap and health check.
- `src/routes/validateAddress.ts` – `POST /validate-address` endpoint.
- `src/schemas/validateAddress.ts` – Request validation schema.
- `src/services/googleAddressValidation.ts` – Google Address Validation API client.
- `src/services/googleTypes.ts` – Minimal types for Google response.
- `src/domain/addressStandardizer.ts` – Map Google result to our address shape.
- `src/domain/deliverability.ts` – DPV-based deliverability rules.
- `env.example` – Example environment variables.

## Setup

1) Install deps: `npm install`
2) Copy env: `cp env.example .env` and set `GOOGLE_MAPS_API_KEY` (must have **Address Validation API** and **Places API** enabled)
3) Run dev: `npm run dev`

To obtain an Google Maps API Key, please refer to [Set up the Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/get-api-key).

## Endpoint
- `POST /validate-address`
  - Body: plain text free-form address (e.g., `1600 Amphitheatre Pkwy, Mountain View, CA 94043`)
  - 200 if deliverable (DPV-confirmed, not missing unit); 422 otherwise.
  - Always returns `suggestions` (from Places Autocomplete) when the input looks incomplete/typo’d and validation is not fully confirmed.

### Example `curl`
```bash
curl -X POST http://localhost:3000/validate-address \
  -H "Content-Type: text/plain" \
  --data-raw "1600 Amphitheatre Pkwy, Mountain View, CA 94043"
```

### Response shape (deliverable)
```json
{
  "input": "...",
  "isDeliverable": true,
  "standardized": {
    "number": "1600",
    "street": "Amphitheatre Pkwy",
    "city": "Mountain View",
    "state": "CA",
    "zip": "94043",
    "zipPlus4": "94043-1351"
  },
  "metadata": {
    "dpvConfirmation": "Y",
    "dpvFootnotes": "AABB",
    "missingSecondary": false
  },
  "issues": [],
  "suggestions": []
}
```

### Response shape (not deliverable, with suggestions)
```json
{
  "input": "...",
  "isDeliverable": false,
  "standardized": {
    "number": "1",
    "street": "Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701",
    "zipPlus4": null
  },
  "metadata": {
    "dpvConfirmation": "N",
    "dpvFootnotes": "AA",
    "missingSecondary": false
  },
  "issues": ["INSUFFICIENT_ADDRESS", "DPV_NOT_CONFIRMED"],
  "suggestions": [
    {
      "description": "123 Main St, Springfield, IL, USA",
      "placeId": "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
      "source": "google_places_autocomplete"
    }
  ]
}
```
