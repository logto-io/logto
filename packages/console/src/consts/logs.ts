import type { AuditLogKey, LogKey, interaction } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

export const auditLogEventTitle = Object.freeze({
  'ExchangeTokenBy.AuthorizationCode': 'Exchange token by Code',
  'ExchangeTokenBy.ClientCredentials': 'Exchange token by Client Credentials',
  'ExchangeTokenBy.RefreshToken': 'Exchange token by Refresh Token',
  'ExchangeTokenBy.TokenExchange': 'Token exchange',
  'Interaction.Create': 'Interaction started',
  'Interaction.End': 'Interaction ended',
  'Interaction.Create.Captcha': 'Create CAPTCHA verification',
  'Interaction.ForgotPassword.Profile.Update': 'Patch update forgot-password interaction profile',
  'Interaction.ForgotPassword.Submit': 'Submit forgot-password interaction',
  'Interaction.ForgotPassword.Update': 'Update forgot-password interaction',
  'Interaction.Register.Profile.Update': 'Patch update register interaction profile',
  'Interaction.Register.Submit': 'Submit register interaction',
  'Interaction.Register.Update': 'Update register interaction',
  'Interaction.SignIn.Profile.Update': 'Patch update sign-in interaction profile',
  'Interaction.SignIn.Submit': 'Submit sign-in interaction',
  'Interaction.SignIn.Update': 'Update sign-in interaction',
  'Interaction.Register.Create': 'Create new register interaction',
  'Interaction.SignIn.Create': 'Create new sign-in interaction',
  'Interaction.ForgotPassword.Create': 'Create new forgot-password interaction',
  'Interaction.SignIn.Identifier.Submit': 'Identify user for sign-in interaction',
  'Interaction.ForgotPassword.Identifier.Submit': 'Identify user for forgot-password interaction',
  'Interaction.Register.Identifier.Submit': 'Create and identify new user for register interaction',
  'Interaction.SignIn.Verification.BackupCode.Create':
    'Sign-in: Create backup codes for MFA binding',
  'Interaction.SignIn.Verification.BackupCode.Submit': 'Sign-in: Verify backup code',
  'Interaction.SignIn.Verification.Totp.Create': 'Create TOTP verification secret for MFA binding',
  'Interaction.SignIn.Verification.Totp.Submit': 'Sign-in: Verify TOTP code',
  'Interaction.SignIn.Verification.WebAuthn.Create': 'Sign-in: Create WebAuthn authentication',
  'Interaction.SignIn.Verification.WebAuthn.Submit': 'Sign-in: Verify WebAuthn authentication',
  'Interaction.SignIn.Verification.SignInWebAuthn.Create':
    'Sign-in: Create passkey sign-in authentication',
  'Interaction.SignIn.Verification.SignInWebAuthn.Submit':
    'Sign-in: Verify passkey sign-in authentication',
  'Interaction.SignIn.Verification.EmailVerificationCode.Create':
    'Create and send sign-in email verification code',
  'Interaction.SignIn.Verification.EmailVerificationCode.Submit':
    'Verify sign-in email verification code',
  'Interaction.SignIn.Verification.PhoneVerificationCode.Create':
    'Create and send sign-in SMS verification code',
  'Interaction.SignIn.Verification.PhoneVerificationCode.Submit':
    'Verify sign-in SMS verification code',
  'Interaction.SignIn.Verification.EnterpriseSso.Create':
    'Create enterprise SSO authentication URL',
  'Interaction.SignIn.Verification.EnterpriseSso.Submit':
    'Sign-in: Verify enterprise SSO authentication',
  'Interaction.SignIn.Verification.Social.Create': 'Sign-in: Create social authentication URL',
  'Interaction.SignIn.Verification.Social.Submit': 'Sign-in: Verify social authentication',
  'Interaction.SignIn.Verification.NewPasswordIdentity.Submit':
    'Create new password identity for register',
  'Interaction.SignIn.Verification.Password.Submit':
    'Create and verify identifier with password verification',
  'Interaction.Register.Verification.BackupCode.Create':
    'Register: Create backup codes for MFA binding',
  'Interaction.Register.Verification.BackupCode.Submit': 'Register: Verify backup code',
  'Interaction.Register.Verification.Totp.Create':
    'Create TOTP verification secret for MFA binding',
  'Interaction.Register.Verification.Totp.Submit': 'Register: Verify TOTP code',
  'Interaction.Register.Verification.WebAuthn.Create': 'Register: Create WebAuthn authentication',
  'Interaction.Register.Verification.WebAuthn.Submit': 'Register: Verify WebAuthn authentication',
  'Interaction.Register.Verification.EmailVerificationCode.Create':
    'Create and send register email verification code',
  'Interaction.Register.Verification.EmailVerificationCode.Submit':
    'Verify register email verification code',
  'Interaction.Register.Verification.PhoneVerificationCode.Create':
    'Create and send register SMS verification code',
  'Interaction.Register.Verification.PhoneVerificationCode.Submit':
    'Verify register SMS verification code',
  'Interaction.Register.Verification.EnterpriseSso.Create':
    'Create enterprise SSO authentication URL',
  'Interaction.Register.Verification.EnterpriseSso.Submit':
    'Register: Verify enterprise SSO authentication',
  'Interaction.Register.Verification.Social.Create': 'Register: Create social authentication URL',
  'Interaction.Register.Verification.Social.Submit': 'Register: Verify social authentication',
  'Interaction.Register.Verification.NewPasswordIdentity.Submit':
    'Create new password identity for register',
  'Interaction.Register.Verification.Password.Submit':
    'Create and verify identifier with password verification',
  'Interaction.ForgotPassword.Verification.EmailVerificationCode.Create':
    'Create and send forgot-password email verification code',
  'Interaction.ForgotPassword.Verification.EmailVerificationCode.Submit':
    'Verify forgot-password email verification code',
  'Interaction.ForgotPassword.Verification.PhoneVerificationCode.Create':
    'Create and send forgot-password SMS verification code',
  'Interaction.ForgotPassword.Verification.PhoneVerificationCode.Submit':
    'Verify forgot-password SMS verification code',
  'Interaction.SignIn.Verification.IdpInitiatedSso.Create':
    'Create IdP-initiated SAML SSO authentication session',
  'JwtCustomizer.AccessToken': 'Get custom user access token claims',
  'JwtCustomizer.ClientCredentials': 'Get custom M2M access token claims',
  'SamlApplication.AuthnRequest': 'Receive SAML application authentication request',
  'SamlApplication.Callback': 'Handle SAML application callback',
} satisfies Partial<Record<Exclude<AuditLogKey, interaction.DeprecatedInteractionLogKey>, string>>);

export const logEventTitle: Record<string, Optional<string>> & {
  [key in LogKey]?: string;
} = {
  ...auditLogEventTitle,
};
