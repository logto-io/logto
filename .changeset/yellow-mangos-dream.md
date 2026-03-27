---
"@logto/core": minor
"@logto/schemas": minor
---

add app-level `maxAllowedGrants` config and enforce concurrent grant limits on authorization success

1. Extended application `customClientMetadata` with a new optional field `maxAllowedGrants`.
   - Use this field to configure the max concurrent grants limit for the current app.
   - Default is `undefined`; when not provided, no concurrent grant limit is applied.

2. Added a new OIDC `authorization.success` event listener.
   - Triggered after each successful user authorization.
   - Validates concurrent grants against the current authorization client and user.
   - If `customClientMetadata.maxAllowedGrants` is configured, revokes the oldest grants when the active grant count exceeds the limit.
