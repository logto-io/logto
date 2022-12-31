import type { LogKey } from '@logto/schemas';

type LogEventTitle = Record<string, string>;

/** @deprecated Don't use or update. @simeng-li clean up along with session api */
const logEventTitleLegacy: LogEventTitle = Object.freeze({
  RegisterUsernamePassword: 'Register with username and password',
  RegisterEmailSendPasscode: 'Register with email (send passcode)',
  RegisterEmail: 'Register with email',
  RegisterSmsSendPasscode: 'Register with SMS (send passcode)',
  RegisterSms: 'Register with SMS',
  RegisterSocialBind: 'Bind social account',
  RegisterSocial: 'Register with social account',
  SignInUsernamePassword: 'Sign in with username and password',
  SignInEmailSendPasscode: 'Sign in with email (send passcode)',
  SignInEmail: 'Register with email',
  SignInSmsSendPasscode: 'Sign in with SMS (send passcode)',
  SignInSms: 'Sign in with SMS',
  SignInSocialBind: 'Sign in with social related account',
  SignInSocial: 'Sign in with social account',
  CodeExchangeToken: 'Exchange token by auth code',
  RefreshTokenExchangeToken: 'Exchange token by refresh token',
  RevokeToken: 'Revoke token',
});

export const logEventTitle: Record<string, string | undefined> & Partial<Record<LogKey, string>> =
  Object.freeze({
    ...logEventTitleLegacy,
    'ExchangeTokenBy.AuthorizationCode': 'Exchange token by auth code',
    'ExchangeTokenBy.RefreshToken': 'Exchange token by refresh token',
    'Interaction.Create': 'Interaction started',
    'Interaction.End': 'Interaction ended',
    'Interaction.SignIn.Update': 'Update sign-in interaction',
    'Interaction.SignIn.Submit': 'Submit sign-in interaction',
    'Interaction.Register.Update': 'Update register interaction',
    'Interaction.Register.Submit': 'Submit register interaction',
    'Interaction.ForgotPassword.Update': 'Update forgot-password interaction',
    'Interaction.ForgotPassword.Submit': 'Submit forgot-password interaction',
    'Interaction.SignIn.Profile.Update': 'Patch Update sign-in interaction profile',
    'Interaction.SignIn.Profile.Create': 'Put new sign-in interaction profile',
    'Interaction.SignIn.Profile.Delete': 'Delete sign-in interaction profile',
    'Interaction.Register.Profile.Update': 'Patch update register interaction profile',
    'Interaction.Register.Profile.Create': 'Put new register interaction profile',
    'Interaction.Register.Profile.Delete': 'Delete register interaction profile',
    'Interaction.ForgotPassword.Profile.Update': 'Patch update forgot-password interaction profile',
    'Interaction.ForgotPassword.Profile.Create': 'Put new forgot-password interaction profile',
    'Interaction.ForgotPassword.Profile.Delete': 'Delete forgot-password interaction profile',
    'Interaction.SignIn.Identifier.Password.Submit': 'Submit sign-in identifier with password',
    'Interaction.ForgotPassword.Identifier.Password.Submit':
      'Submit forgot-password identifier with password',
    'Interaction.SignIn.Identifier.VerificationCode.Create':
      'Create and send sign-in verification code',
    'Interaction.SignIn.Identifier.VerificationCode.Submit':
      'Submit and verify sign-in identifier with verification code',
    'Interaction.SignIn.Identifier.Social.Create': 'Create social sign-in authorization-url',
    'Interaction.SignIn.Identifier.Social.Submit': 'Authenticate and submit social identifier',
    'Interaction.Register.Identifier.VerificationCode.Create':
      'Create and send register identifier with verification code',
    'Interaction.Register.Identifier.VerificationCode.Submit':
      'Submit and verify register verification code',
    'Interaction.ForgotPassword.Identifier.VerificationCode.Create':
      'Create and send forgot-password verification code',
    'Interaction.ForgotPassword.Identifier.VerificationCode.Submit':
      'Submit and verify forgot-password verification code',
  });
