# @logto/connector-gitlab

## 1.0.0

### Major Changes

- 31296f0bc: add GitLab social connector leveraging OAuth2

  ### Major Changes

  - Initial release of the GitLab connector.

    This release introduces the Logto connector for GitLab, enabling social sign-in using GitLab accounts. It supports OAuth 2.0 authentication flow, fetching user information, and handling errors gracefully.

  ### Features

  - **OAuth 2.0 Authentication**: Support for OAuth 2.0 authentication flow with GitLab.
  - **User Information Retrieval**: Fetches user details such as full name, email, profile URL, and avatar.
  - **Error Handling**: Graceful handling of OAuth errors, including token exchange failures and user-denied permissions.
  - **Configurable Scope**: Allows customization of OAuth scopes to access different levels of user information.

### Patch Changes

- Updated dependencies [27d2c91d2]
  - @logto/connector-oauth@1.5.0
