---
"@logto/connector-oauth": patch
"@logto/connector-oidc": patch
---

accept string-typed `expires_in` in token responses

Some identity providers, such as Criipto, return `expires_in` as a string instead of a number. Social sign-in with the generic OAuth 2.0 and OIDC connectors no longer fails with an invalid response error for these providers.
