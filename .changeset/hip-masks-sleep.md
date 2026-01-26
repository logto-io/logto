---
"@logto/console": patch
---

fix console audit log dropdown event key typo that caused empty filter results

Affected events:

- `Interaction.SignIn.Verification.WebAuthn.Create`
- `Interaction.SignIn.Verification.PhoneVerificationCode.Create`
- `Interaction.SignIn.Verification.PhoneVerificationCode.Submit`
- `Interaction.Register.Verification.WebAuthn.Create`
- `Interaction.Register.Verification.PhoneVerificationCode.Create`
- `Interaction.Register.Verification.PhoneVerificationCode.Submit`
- `Interaction.Register.Verification.NewPasswordIdentity.Submit`
- `Interaction.ForgotPassword.Verification.PhoneVerificationCode.Create`
- `Interaction.ForgotPassword.Verification.PhoneVerificationCode.Submit`
- `JwtCustomizer.ClientCredentials`
