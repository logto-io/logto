---
"@logto/core": minor
---

Provide management APIs to help link social identities to user

- POST `/users/:userId/identities` to link a social identity to a user
- POST `/connectors/:connectorId/authorization-uri` to get the authorization URI for a connector
