---
"@logto/console": minor
---

feat: Add federated token storage support for social and enterprise SSO connectors

This update introduces the new [Secret Vault](https://docs.logto.io/secret-vault/) feature in Logto.

The Secret Vault is designed to securely store sensitive user data — such as access tokens, API keys, passcodes, and other confidential information. These secrets are typically used to access third-party services on behalf of users, making secure storage essential.

With this release, federated token set storage support is added to both social and enterprise SSO connectors. When enabled, Logto will securely store the token set issued by the provider after a successful user authentication. Applications can then retrieve the access token later to access third-party APIs without requiring the user to reauthenticate.

- **Social connector details page**: For supported connectors (GitHub, Google, Facebook, Standard OAuth 2.0, and Standard OIDC), a new switch has been added to enable token storage.
- **Enterprise SSO connector details page**: For all OIDC-based SSO connectors, a new switch has been added to enable token storage.
- **User detail page**: Refactored layout. User social and enterprise SSO identities are now organized into a new Connection section. This section lists all of a user’s linked connections, showing third-party identity information and token storage status (if applicable).
- **New user identity details page**: Introduced a dedicated page for managing individual third-party identities. Use this page to view identity details and token storage status.
