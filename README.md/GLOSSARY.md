# Glossary of Terms

This document provides a glossary of terms used in the project.

## USPS
United States Postal Service. The federal postal service responsible for delivering mail in the United States.

## DPV
Delivery Point Validation. A USPS system that confirms whether an address is deliverable, with special attention to the presence of required secondary information (like apartment or suite numbers).

## DPV confirmation codes
USPS signals such as `Y` (deliverable), `N` (not deliverable), `S`/`D` (needs secondary like Apt/Suite).

## CASS
Coding Accuracy Support System. A USPS certification program used to standardize and validate mailing addresses, ensuring accuracy and deliverability.

## Secondary (Unit/Apt/Suite)
The sub-premise portion required for multi-unit deliverability.

## ZIP+4
9-digit ZIP; ZIP plus a 4-digit add-on that pinpoints the delivery point.
For example, `12345-1234`.

## Standardization
Normalizing casing/abbreviations into a canonical address format (street, city, state, ZIP).

## Deliverability
Whether USPS can deliver to the address as provided (DPV-backed).

## Address Validation API (Google)
Upstream service used to parse, standardize, and return USPS-derived DPV signals.

## Address components
Structured parts returned by Google (street_number, route, locality, administrativeArea, postalCode, regionCode).

## Unconfirmed components
Parts Google could not fully verify; we treat these as issues.

## Missing secondary
DPV signal indicating a required unit/suite is missing for delivery.
