---
"@logto/core": patch
---

improve SSO connectors with case-insensitive domain matching

According to the latest standards, email domains should be treated as case-insensitive. To ensure robust and user-friendly authentication, we need to locate SSO connectors correctly regardless of the letter case in the provided email domain.

- Domain normalization on insert: The domains configured for SSO connectors are now normalized to lowercase before being inserted into the database. This ensures consistency and prevents issues arising from varied casing. As part of this change, identical domains with different casing will be treated as duplicates and rejected to maintain data integrity.

- Case-insensitive search for SSO connectors: The get SSO connectors by email endpoint has been updated to perform a case-insensitive search when matching email domains. This guarantees that the correct enabled SSO connector is identified, regardless of the casing used in the user's email address.
