---
"@logto/account": minor
"@logto/console": minor
"@logto/core": minor
"@logto/experience": minor
"@logto/phrases": minor
"@logto/schemas": minor
---

support OIDC step-up authentication for Account Center and developer applications

Clients can request `acr_values` and `max_age` and receive `acr`, `amr`, and `auth_time` in ID tokens, access tokens, and introspection responses. The built-in Account Center now authorizes sensitive Account API operations with a fresh first-party `urn:logto:acr:1fa` access token instead of a separate verification record, and the legacy permission-verification runtime is removed.
