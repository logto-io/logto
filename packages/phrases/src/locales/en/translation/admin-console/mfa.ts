const mfa = {
  title: 'Multi-factor authentication',
  description:
    'Add multi-factor authentication to elevate the security of your sign-in experience.',
  factors: 'Factors',
  multi_factors: 'Multi-factors',
  multi_factors_description:
    'Users need to verify one of the enabled factors for 2-step authentication.',
  totp: 'Authenticator app OTP',
  otp_description: 'Link Google Authenticator, etc., to verify one-time passwords.',
  webauthn: 'WebAuthn',
  webauthn_description: 'WebAuthn uses the passkey to verify the user’s device including YubiKey.',
  backup_code: 'Backup code',
  backup_code_description: 'Generate 10 unique codes, each usable for a single authentication.',
  backup_code_setup_hint: 'The backup authentication factor which can not be enabled alone:',
  backup_code_error_hint:
    'To use Backup code for MFA, other factors must be turned on to ensure your users successful sign-in.',
  policy: 'Policy',
  two_step_sign_in_policy: '2-step authentication policy at sign-in',
  user_controlled: 'Users have the choice to enable MFA personally.',
  mandatory: 'Mandatory MFA for all your users at every sign-in.',
  unlock_reminder:
    'Unlock MFA to verification security by upgrading to a paid plan. Don’t hesitate to <a>contact us</a> if you need any assistance.',
  view_plans: 'View plans',
};

export default Object.freeze(mfa);
