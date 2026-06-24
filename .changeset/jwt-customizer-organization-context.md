---
"@logto/core": minor
"@logto/schemas": minor
"@logto/console": minor
---

expose the target organization to the access token JWT customizer for organization (API resource) tokens

When Logto issues an organization access token (a token requested with both `organization_id` and `resource`), the access token JWT customizer now receives a `context.organization` object with the target organization's `id`, `name`, `description` and `customData`. Previously the customizer was invoked with the same payload as a regular user access token and had no way to know which organization the token was being issued for — the `organization_id` claim is only injected after the customizer runs.

This lets scripts attach per-organization claims (for example mapping the Logto organization id to an internal id stored in `organization.customData`) without embedding a map of every organization the user belongs to into every token.
