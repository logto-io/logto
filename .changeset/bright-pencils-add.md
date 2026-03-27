---
"@logto/core": minor
---

introduce user application grant management endpoints for account and management APIs

Account API:

- Added `GET /my-account/grants` to list active application grants for the current user.
- Added `DELETE /my-account/grants/:grantId` to revoke a specific grant for the current user.

Management API:

- Added `GET /users/:userId/grants` to list active application grants for a given user.
- Added `DELETE /users/:userId/grants/:grantId` to revoke a specific grant for a given user.

Grant listing endpoints support an optional `appType` query parameter:

- `appType=firstParty` to list first-party app grants only.
- `appType=thirdParty` to list third-party app grants only.
- Omit `appType` to return all active grants.
