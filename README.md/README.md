# Property Address Validation API

Simple Fastify + TypeScript API exposing `POST /validate-address` for US address validation/standardization using Google Maps Platform Address Validation (USPS DPV-backed).

## Glossary of Terms

- USPS: United States Postal Service
- DPV: Delivery Point Validation
- CASS: Common Address Standardization System

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
2) Copy env: `cp env.example .env` and set `GOOGLE_MAPS_API_KEY`
3) Run dev: `npm run dev`

## Endpoint
- `POST /validate-address`
  - Body: `{ "address": "1600 Amphitheatre Pkwy, Mountain View, CA 94043" }`
  - 200 if deliverable (DPV-confirmed, not missing unit); 422 otherwise.

### Example `curl`
```bash
curl -X POST http://localhost:3000/validate-address \
  -H "Content-Type: application/json" \
  -d '{"address":"1600 Amphitheatre Pkwy, Mountain View, CA 94043"}'
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
  "issues": []
}
```

