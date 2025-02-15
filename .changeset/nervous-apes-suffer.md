---
"@logto/integration-tests": patch
"@logto/core-kit": patch
"@logto/console": patch
"@logto/phrases": patch
"@logto/core": patch
---

loose redirect uri restrictions

Logto has been following the industry best practices for OAuth2.0 and OIDC from the start. However, in the real world, there are things we cannot control, like third-party services or operation systems like Windows.

This update relaxes restrictions on redirect URIs to allow the following:

1. A mix of native and HTTP(S) redirect URIs. For example, a native app can now use a redirect URI like `https://example.com`.
2. Native schemes without a period (`.`). For example, `myapp://callback` is now allowed.

When such URIs are configured, Logto Console will display a prominent warning. This change is backward-compatible and will not affect existing applications.

We hope this change will make it easier for you to integrate Logto with your applications.
