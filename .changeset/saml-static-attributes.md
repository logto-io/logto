---
"@logto/core": minor
"@logto/schemas": minor
"@logto/phrases": minor
---

add static attributes to SAML application assertions

SAML applications can define fixed attribute name-value pairs with the `staticAttributes` field of the `POST /api/saml-applications` and `PATCH /api/saml-applications/{id}` Management APIs. They are added to every assertion alongside the mapped user attributes, for service providers that require constant values such as an account or site ID.

Attribute names may contain letters, digits, and `_.:/#@-`. They must not conflict with each other or with the user attribute names in the assertion, including names that differ only in case or separators, such as `site_id` and `siteId`.
