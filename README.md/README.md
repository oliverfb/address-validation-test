# Property Address Validation API

Simple Fastify + TypeScript API exposing `POST /validate-address` for US address validation/standardization using Google Maps Platform Address Validation (USPS DPV-backed).

## Glossary of Terms
Please refer to the [GLOSSARY.md](GLOSSARY.md) file for a glossary of terms used in the project.

## How it works

The validate address endpoint works as follows:
1. Receives a request to validate an address.
2. Validates the address using the Google Maps Platform Address Validation API.
3. Standardizes the address using the Common Address Standardization System.
4. Assesses the deliverability of the address using the USPS Delivery Point Validation API.
5. If there are issues with the address, it will return suggestions from the Google Places API for Autocomplete.
5. Returns the result to the caller.

## File structure
- `src/server.ts` – Fastify bootstrap and health check.
- `src/routes/validateAddress.ts` – `POST /validate-address` endpoint.
- `src/schemas/validateAddress.ts` – Request validation schema.
- `src/services/*` – Services for the project. Includes clients for Google Address Validation API and Google Places Autocomplete.
- `src/types/*` – TypeScript types for the project.
- `src/domain/*` – Domain logic for the project. Includes address standardizer and deliverability assessor.
- `env.example` – Example environment variables.

## Setup

1) Install deps: `npm install`
2) Copy env: `cp env.example .env` and set `GOOGLE_MAPS_API_KEY` (must have **Address Validation API** and **Places API** enabled)
3) Run dev: `npm run dev`

To obtain an Google Maps API Key, please refer to [Setting up API keys](https://support.google.com/googleapi/answer/6158862?hl=en).
You may also refer to [Setting up the Google Maps Platform](https://developers.google.com/maps/documentation/address-validation/get-api-key).

After obtaining the API key, please enable the **Address Validation API** and **Places API** in the Google Cloud Console.

## Third-party APIs

- [Google Address Validation API](https://developers.google.com/maps/documentation/address-validation/overview): validates and standardizes US addresses and returns USPS DPV signals that drive `isDeliverable`, `issues`, and `metadata`.
- [Google Places API for Autocomplete](https://developers.google.com/maps/documentation/places/web-service): provides address suggestions for incomplete or typo’d input; results are returned in `suggestions` on `/validate-address`.

## Endpoint
- `POST /validate-address`
  - Body: plain text free-form address (e.g., `1600 Amphitheatre Pkwy, Mountain View, CA 94043`)
  - 200 if deliverable (DPV-confirmed, not missing unit); 422 otherwise.
  - Returns `suggestions` (from Places Autocomplete) when the input looks incomplete/typo’d and validation is not fully confirmed.

### Example `curl`
```bash
curl -X POST http://localhost:3000/validate-address \
  -H "Content-Type: text/plain" \
  --data-raw "1600 Amphitheatre Pkwy, Mountain View, CA 94043"
```

### Response shape (deliverable)

Status code: 200

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

Status code: 422

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
  "issues": [
    "INSUFFICIENT_ADDRESS: Address is incomplete or missing required fields",
    "DPV_NOT_CONFIRMED: Address could not be fully confirmed; please double-check spelling and ZIP"
  ],
  "suggestions": [
    "1 Main St, Springfield, TN, USA",
    "Main Street, Springfield, IL, USA",
    "1 Main St, Springfield, MA, USA",
    "1 Main St, Waggoner, IL, USA",
    "South 1st Street, Springfield, IL 62701, USA"
  ]
}
```

### Response shape (invalid request)

Status code: 400

```json
{
  "error": "INVALID_REQUEST",
  "message": "address is required"
}
```