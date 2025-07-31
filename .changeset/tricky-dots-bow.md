---
"@logto/core": minor
"@logto/schemas": minor
---

feat: introduce Logto Secret Vault and Federated token set storage

This update introduces the new [Secret Vault](https://docs.logto.io/secret-vault/) feature in Logto.

The Secret Vault is designed to securely store sensitive user data — such as access tokens, API keys, passcodes, and other confidential information. These secrets are typically used to access third-party services on behalf of users, making secure storage essential.

With this release, federated token set storage support is added to both social and enterprise SSO connectors. When enabled, Logto will securely store the token set issued by the provider after a successful user authentication. Applications can then retrieve the access token later to access third-party APIs without requiring the user to reauthenticate.

Supported connectors include:

- **Social connectors**: GitHub, Google, Facebook, Standard OAuth 2.0, and Standard OIDC.
- **Enterprise SSO connectors**: All OIDC-based SSO connectors.

1. Enable the token storage as needed for social and enterprise SSO connectors in the Logto Console or via the Logto Management API.
2. Once enabled, Logto will automatically store the token set issued by the provider after a successful user authentication.
3. After the token set is stored, you can retrieve the access token via the Logto Account API for the user. This allows your application to access third-party APIs without requiring the user to reauthenticate.

For more details, please check the [Federated token set storage](https://docs.logto.io/secret-vault/federated-token-set) documentation.

Note:
For OSS users, to enable the Secret Vault feature, you must set the `SECRET_VAULT_KEK` environment variable to a valid base64 enabled secret key. This key is used to encrypt and decrypt the secrets stored in the vault. For more information, please refer to the [configuration variables](https://docs.logto.io/concepts/core-service/configuration#variables) documentation.
