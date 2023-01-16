---
"@logto/connector-kit": patch
---

1. Add `connectorId`, `connectorFactoryId` and `jti` to `GetAuthorizationUri`.
2. Make `ConnectorSession` compatible for arbitrary keys.
3. Add `mode` (controls the connector session updating scheme) and `preserveResult` (controls whether to clear connector session after getting operation) to `SetSession` and `GetSession` respectively.
