import type { AuditLogKey, LogKey } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

export const auditLogEventTitle: Record<string, Optional<string>> & {
  [key in AuditLogKey]?: string;
} = Object.freeze({
  'ExchangeTokenBy.AuthorizationCode': 'Exchange token by Code',
  'ExchangeTokenBy.ClientCredentials': 'Exchange token by Client Credentials',
  'ExchangeTokenBy.RefreshToken': 'Exchange token by Refresh Token',
  'ExchangeTokenBy.TokenExchange': 'Token exchange',
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
  'Interaction.Register.Identifier.VerificationCode.Create':
    'Create and send register identifier with verification code',
  'Interaction.Register.Identifier.VerificationCode.Submit':
    'Submit and verify register verification code',
  'Interaction.Register.Profile.Create': 'Put new register interaction profile',
  'Interaction.Register.Profile.Delete': 'Delete register interaction profile',
  'Interaction.Register.Profile.Update': 'Patch update register interaction profile',
  'Interaction.Register.Submit': 'Submit register interaction',
  'Interaction.Register.Update': 'Update register interaction',
  'Interaction.SignIn.Identifier.Password.Submit': 'Submit sign-in identifier with password',
  'Interaction.SignIn.Identifier.Social.Create': 'Create social sign-in authorization-url',
  'Interaction.SignIn.Identifier.Social.Submit': 'Authenticate and submit social identifier',
  'Interaction.SignIn.Identifier.VerificationCode.Create':
    'Create and send sign-in verification code',
  'Interaction.SignIn.Identifier.VerificationCode.Submit':
    'Submit and verify sign-in identifier with verification code',
  'Interaction.SignIn.Profile.Create': 'Put new sign-in interaction profile',
  'Interaction.SignIn.Profile.Delete': 'Delete sign-in interaction profile',
  'Interaction.SignIn.Profile.Update': 'Patch update sign-in interaction profile',
  'Interaction.SignIn.Submit': 'Submit sign-in interaction',
  'Interaction.SignIn.Update': 'Update sign-in interaction',
  'Interaction.SignIn.Identifier.SingleSignOn.Create':
    'Create single-sign-on authentication session',
  'Interaction.SignIn.Identifier.SingleSignOn.Submit':
    'Submit single-sign-on authentication interaction',
  'Interaction.Register.Create': 'Create new register interaction',
  'Interaction.SignIn.Create': 'Create new sign-in interaction',
  'Interaction.ForgotPassword.Create': 'Create new forgot-password interaction',
  'Interaction.SignIn.Identifier.Submit': 'Identify user for sign-in interaction',
  'Interaction.ForgotPassword.Identifier.Submit': 'Identify user for forgot-password interaction',
  'Interaction.Register.Identifier.Submit': 'Create and identify new user for register interaction',
  'Interaction.SignIn.Verification.BackupCode.Create': 'Create backup codes for MFA binding',
  'Interaction.SignIn.Verification.BackupCode.Submit': 'Verify backup code',
  'Interaction.SignIn.Verification.Totp.Create': 'Create TOTP verification secret for MFA binding',
  'Interaction.SignIn.Verification.Totp.Submit': 'Verify TOTP verification code',
  'Interaction.SignIn.Verification.Webauthn.Create': 'Create WebAuthn authentication',
  'Interaction.SignIn.Verification.WebAuthn.Submit': 'Verify WebAuthn authentication',
  'Interaction.SignIn.Verification.EmailVerificationCode.Create':
    'Create and send sign-in email verification code',
  'Interaction.SignIn.Verification.EmailVerificationCode.Submit':
    'Verify sign-in email verification code',
  'Interaction.SignIn.Verification.SmsVerificationCode.Create':
    'Create and send sign-in SMS verification code',
  'Interaction.SignIn.Verification.SmsVerificationCode.Submit':
    'Verify sign-in SMS verification code',
  'Interaction.SignIn.Verification.EnterpriseSso.Create':
    'Create enterprise SSO authentication URL',
  'Interaction.SignIn.Verification.EnterpriseSso.Submit': 'Verify enterprise SSO authentication',
  'Interaction.SignIn.Verification.Social.Create': 'Create social authentication URL',
  'Interaction.SignIn.Verification.Social.Submit': 'Verify social authentication',
  'Interaction.SignIn.Verification.NewPassword.Submit': 'Create new password identity for register',
  'Interaction.SignIn.Verification.Password.Submit':
    'Create and verify identifier with password verification',
  'Interaction.Register.Verification.BackupCode.Create': 'Create backup codes for MFA binding',
  'Interaction.Register.Verification.BackupCode.Submit': 'Verify backup code',
  'Interaction.Register.Verification.Totp.Create':
    'Create TOTP verification secret for MFA binding',
  'Interaction.Register.Verification.Totp.Submit': 'Verify TOTP verification code',
  'Interaction.Register.Verification.Webauthn.Create': 'Create WebAuthn authentication',
  'Interaction.Register.Verification.WebAuthn.Submit': 'Verify WebAuthn authentication',
  'Interaction.Register.Verification.EmailVerificationCode.Create':
    'Create and send register email verification code',
  'Interaction.Register.Verification.EmailVerificationCode.Submit':
    'Verify register email verification code',
  'Interaction.Register.Verification.SmsVerificationCode.Create':
    'Create and send register SMS verification code',
  'Interaction.Register.Verification.SmsVerificationCode.Submit':
    'Verify register SMS verification code',
  'Interaction.Register.Verification.EnterpriseSso.Create':
    'Create enterprise SSO authentication URL',
  'Interaction.Register.Verification.EnterpriseSso.Submit': 'Verify enterprise SSO authentication',
  'Interaction.Register.Verification.Social.Create': 'Create social authentication URL',
  'Interaction.Register.Verification.Social.Submit': 'Verify social authentication',
  'Interaction.Register.Verification.NewPassword.Submit':
    'Create new password identity for register',
  'Interaction.Register.Verification.Password.Submit':
    'Create and verify identifier with password verification',
  'Interaction.ForgotPassword.Verification.EmailVerificationCode.Create':
    'Create and send forgot-password email verification code',
  'Interaction.ForgotPassword.Verification.EmailVerificationCode.Submit':
    'Verify forgot-password email verification code',
  'Interaction.ForgotPassword.Verification.SmsVerificationCode.Create':
    'Create and send forgot-password SMS verification code',
  'Interaction.ForgotPassword.Verification.SmsVerificationCode.Submit':
    'Verify forgot-password SMS verification code',
});

export const logEventTitle: Record<string, Optional<string>> & {
  [key in LogKey]?: string;
} = {
  ...auditLogEventTitle,
};
