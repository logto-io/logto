# @logto/connector-patreon

## 1.0.0

### Major Changes

- Initial release of the Patreon connector.

  This release introduces the Logto connector for Patreon, enabling social sign-in using Patreon accounts. It supports OAuth 2.0 authentication flow, fetching user information, and handling errors gracefully.

- Base code adapted from the GitHub connector.

  The Patreon connector's initial version is largely based on the GitHub connector developed by Silverhand Inc. and the Logto team. Many implementation patterns, error handling strategies, and configuration options were inspired by the GitHub connector. Acknowledgments to the original creators at Silverhand Inc. for their foundational work.

### Features

- **OAuth 2.0 Authentication**: Support for OAuth 2.0 authentication flow with Patreon.
- **User Information Retrieval**: Fetches user details such as full name, email, profile URL, and avatar.
- **Error Handling**: Graceful handling of OAuth errors, including token exchange failures and user-denied permissions.
- **Configurable Scope**: Allows customization of OAuth scopes to access different levels of user information.

---
