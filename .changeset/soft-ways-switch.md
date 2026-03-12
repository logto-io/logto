---
"@logto/integration-tests": minor
"@logto/experience": minor
"@logto/console": minor
"@logto/core": minor
---

support passkey sign-in authentication method

### Summary

Passkey sign-in provides a faster, passwordless sign-in experience that reduces friction for end users and helps improve account security. It removes repeated password entry for returning users, works with platform authenticators users already trust (for example Face ID, Touch ID, Windows Hello), and offers a smoother path from account creation to subsequent sign-ins.

#### Bind passkey for sign-in

After passkey sign-in is enabled, new users are prompted to bind a passkey during registration. Existing users who have not bound a passkey (WebAuthn) factor yet can be guided to bind one in a later sign-in flow. If a user already has a WebAuthn credential from MFA setup, that credential can be reused directly for passkey sign-in without requiring another registration step.

#### Various sign-in flows to support different user journeys and preferences

1. **Passkey sign-in button**: When **Show passkey sign-in button** is enabled, users can click **Continue with passkey** on the sign-in page to immediately trigger the browser passkey chooser and complete sign-in.

2. **Identifier-first flow (button hidden)**: When **Show passkey sign-in button** is disabled, sign-in follows an identifier-first flow. Users first enter an identifier (for example email or username) on the first screen. On the next step, the flow prioritizes passkey and prompts users to **Verify via passkey** before falling back to password or verification code when needed.

3. **Allow autofill**: When **Allow autofill** is enabled, supported browsers can show passkey suggestions directly from the identifier input on the sign-in page. Users can select a previously saved passkey from the autofill popup and sign in with minimal extra input.

Check out our [documentation](https://docs.logto.io/end-user-flows/passkey-sign-in) for more details.
