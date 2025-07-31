---
"@logto/connector-facebook": minor
"@logto/connector-oauth": minor
"@logto/connector-oidc": minor
"@logto/connector-google": minor
---

feat: add token storage support to social connectors

The connector has been updated to support token storage. When enabled, Logto will securely store the token set issued by social providers in the [Secret Vault](https://docs.logto.io/secret-vault/) after successful user authentication. This allows your application to retrieve the access token later and access third-party APIs without requiring the user to reauthenticate. Please check the [Federated token set storage](https://docs.logto.io/secret-vault/federated-token-set) for more details.
