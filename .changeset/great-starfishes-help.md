---
"@logto/core": minor
"@logto/experience": minor
"@logto/schemas": minor
"@logto/connector-kit": minor
---

add support to the OIDC standard authentication parameter `ui_locales`

We are now supporting the standard OIDC `ui_locales` auth parameter to customize the language of the authentication pages. You can pass the `ui_locales` parameter in the `signIn` method via the `extraParams` option in all Logto SDKs.

### What it does

- Determines the UI language of the Logto-hosted sign-in experience at runtime. Logto picks the first language tag in `ui_locales` that is supported in your tenant's language library.
- Affects email localization for messages triggered by the interaction (e.g., verification code emails).
- Exposes the original value to email templates as a variable `uiLocales`, allowing you to include it in the email subject/content if needed.

### Example

If you want to display the sign-in page in French (Canada), you can do it like this:

```ts
await logtoClient.signIn({
  redirectUri: 'https://your.app/callback',
  extraParams: {
    ui_locales: 'fr-CA fr en',
  },
});
```

Refer to the [documentation](https://docs.logto.io/end-user-flows/authentication-parameters/ui-locales) for more details.
