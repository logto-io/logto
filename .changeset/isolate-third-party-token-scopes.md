---
"@logto/core": patch
---

isolate personal and organization API scopes on third-party and CIMD access tokens

When issuing access tokens for third-party applications and CIMD clients, Logto now strictly isolates personal and organization permission contexts based on `organization_id`. Personal API tokens (without `organization_id`) only include scopes from personal global roles and personal API resource configurations, organization API tokens (with `organization_id`) only include scopes from the target organization's roles and organization API resource configurations, and token requests targeting the virtual `urn:logto:resource:organizations` resource return an empty scope without an `organization_id` claim.

To migrate existing third-party applications or CIMD clients: pass `organization_id` to obtain organization API permissions; omit `organization_id` to obtain personal API permissions.
