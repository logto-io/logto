---
"@logto/console": patch
---

fix SAML app creation API call query params

The parameter should be named as "types" instead of the current "type" as this may cause the filter to not take effect when requesting the API, potentially leading to incorrect calculations in the paywall during the creation of the SAML app.
