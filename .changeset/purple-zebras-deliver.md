---
"@logto/core": minor
"@logto/schemas": minor
---

manage WebAuthn passkeys in Account API

You can now manage WebAuthn passkeys in Account API, including:

1. Bind a WebAuthn passkey to the user's account through your website.
2. Manage the passkeys in the user's account.

We implemented [Related Origin Requests](https://passkeys.dev/docs/advanced/related-origins/) so that you can manage the WebAuthn passkeys in your website which has a different domain from the Logto's sign-in page.

To learn more, checkout the [documentation](https://docs.logto.io/end-user-flows/account-settings/by-account-api).
