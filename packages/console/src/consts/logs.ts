import type { AuditLogKey, WebhookLogKey, JwtCustomizerLogKey, LogKey } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

export const auditLogEventTitle: Record<string, Optional<string>> &
  Record<AuditLogKey, Optional<string>> = Object.freeze({
  'ExchangeTokenBy.AuthorizationCode': 'Exchange token by Code',
  'ExchangeTokenBy.ClientCredentials': 'Exchange token by Client Credentials',
  'ExchangeTokenBy.RefreshToken': 'Exchange token by Refresh Token',
  'ExchangeTokenBy.Unknown': undefined,
  'Interaction.Create': 'Interaction started',
  'Interaction.End': 'Interaction ended',
  'Interaction.ForgotPassword.Identifier.VerificationCode.Create':
    'Create and send forgot-password verification code',
  'Interaction.ForgotPassword.Identifier.VerificationCode.Submit':
    'Submit and verify forgot-password verification code',
  'Interaction.ForgotPassword.Profile.Create': 'Put new forgot-password interaction profile',
  'Interaction.ForgotPassword.Profile.Delete': 'Delete forgot-password interaction profile',
  'Interaction.ForgotPassword.Profile.Update': 'Patch update forgot-password interaction profile',
  'Interaction.ForgotPassword.Submit': 'Submit forgot-password interaction',
  'Interaction.ForgotPassword.Update': 'Update forgot-password interaction',
  'Interaction.ForgotPassword.BindMfa.Totp.Create': undefined,
  'Interaction.ForgotPassword.BindMfa.Totp.Submit': undefined,
  'Interaction.ForgotPassword.BindMfa.BackupCode.Create': undefined,
  'Interaction.ForgotPassword.BindMfa.BackupCode.Submit': undefined,
  'Interaction.ForgotPassword.BindMfa.WebAuthn.Create': undefined,
  'Interaction.ForgotPassword.BindMfa.WebAuthn.Submit': undefined,
  'Interaction.Register.Identifier.Password.Submit': undefined,
  'Interaction.Register.Identifier.Social.Create': undefined,
  'Interaction.Register.Identifier.Social.Submit': undefined,
  'Interaction.Register.Identifier.VerificationCode.Create':
    'Create and send register identifier with verification code',
  'Interaction.Register.Identifier.VerificationCode.Submit':
    'Submit and verify register verification code',
  'Interaction.Register.Profile.Create': 'Put new register interaction profile',
  'Interaction.Register.Profile.Delete': 'Delete register interaction profile',
  'Interaction.Register.Profile.Update': 'Patch update register interaction profile',
  'Interaction.Register.Submit': 'Submit register interaction',
  'Interaction.Register.Update': 'Update register interaction',
  'Interaction.Register.BindMfa.Totp.Create': undefined,
  'Interaction.Register.BindMfa.Totp.Submit': undefined,
  'Interaction.Register.BindMfa.BackupCode.Create': undefined,
  'Interaction.Register.BindMfa.BackupCode.Submit': undefined,
  'Interaction.Register.BindMfa.WebAuthn.Create': undefined,
  'Interaction.Register.BindMfa.WebAuthn.Submit': undefined,
  'Interaction.Register.SingleSignOn.Create': undefined,
  'Interaction.Register.SingleSignOn.Submit': undefined,
  'Interaction.SignIn.Identifier.Password.Submit': 'Submit sign-in identifier with password',
  'Interaction.SignIn.Identifier.Social.Create': 'Create social sign-in authorization-url',
  'Interaction.SignIn.Identifier.Social.Submit': 'Authenticate and submit social identifier',
  'Interaction.SignIn.Identifier.VerificationCode.Create':
    'Create and send sign-in verification code',
  'Interaction.SignIn.Identifier.VerificationCode.Submit':
    'Submit and verify sign-in identifier with verification code',
  'Interaction.SignIn.Profile.Create': 'Put new sign-in interaction profile',
  'Interaction.SignIn.Profile.Delete': 'Delete sign-in interaction profile',
  'Interaction.SignIn.Profile.Update': 'Patch Update sign-in interaction profile',
  'Interaction.SignIn.Submit': 'Submit sign-in interaction',
  'Interaction.SignIn.Update': 'Update sign-in interaction',
  'Interaction.SignIn.BindMfa.Totp.Create': undefined,
  'Interaction.SignIn.BindMfa.Totp.Submit': undefined,
  'Interaction.SignIn.BindMfa.BackupCode.Create': undefined,
  'Interaction.SignIn.BindMfa.BackupCode.Submit': undefined,
  'Interaction.SignIn.BindMfa.WebAuthn.Create': undefined,
  'Interaction.SignIn.BindMfa.WebAuthn.Submit': undefined,
  'Interaction.SignIn.Mfa.Totp.Create': undefined,
  'Interaction.SignIn.Mfa.Totp.Submit': undefined,
  'Interaction.SignIn.Mfa.BackupCode.Create': undefined,
  'Interaction.SignIn.Mfa.BackupCode.Submit': undefined,
  'Interaction.SignIn.Mfa.WebAuthn.Create': undefined,
  'Interaction.SignIn.Mfa.WebAuthn.Submit': undefined,
  'Interaction.SignIn.Identifier.SingleSignOn.Create':
    'Create single-sign-on authentication session',
  'Interaction.SignIn.Identifier.SingleSignOn.Submit':
    'Submit single-sign-on authentication interaction',
  'Interaction.Register.Identifier.SingleSignOn.Create': undefined,
  'Interaction.Register.Identifier.SingleSignOn.Submit': undefined,
  RevokeToken: undefined,
  Unknown: undefined,
});

// `webhookLogEventTitle` and `logEventTitle` are not used yet, keep them just in case.
const webhookLogEventTitle: Record<string, Optional<string>> &
  Record<WebhookLogKey, Optional<string>> = Object.freeze({
  'TriggerHook.PostRegister': undefined,
  'TriggerHook.PostResetPassword': undefined,
  'TriggerHook.PostSignIn': undefined,
});

const jwtCustomizerLogEventTitle: Record<string, Optional<string>> &
  Record<JwtCustomizerLogKey, Optional<string>> = Object.freeze({
  'JwtCustomizer.AccessToken': undefined,
  'JwtCustomizer.ClientCredentials': undefined,
});

export const logEventTitle: Record<string, Optional<string>> & Record<LogKey, Optional<string>> = {
  ...auditLogEventTitle,
  ...webhookLogEventTitle,
  ...jwtCustomizerLogEventTitle,
};
