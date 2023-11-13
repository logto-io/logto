const mfa = {
  title: 'Multi-factor authentication',
  description:
    'Add multi-factor authentication to elevate the security of your sign-in experience.',
  factors: 'Factors',
  multi_factors: 'Multi-factors',
  multi_factors_description:
    'Users need to verify one of the enabled factors for 2-step verification.',
  totp: 'Authenticator app OTP',
  otp_description: 'Link Google Authenticator, etc., to verify one-time passwords.',
  webauthn: 'WebAuthn (Passkey)',
  webauthn_description:
    'Verify via browser-supported method: biometrics, phone scanning, or security key, etc.',
  webauthn_native_tip: 'WebAuthn is not supported for Native applications.',
  webauthn_domain_tip:
    'WebAuthn binds public keys to the specific domain. Modifying your service domain will block users from authenticating via existing passkeys.',
  backup_code: 'Backup code',
  backup_code_description: 'Generate 10 one-time backup codes after users set up any MFA method.',
  backup_code_setup_hint: "When users can't verify the above MFA factors, use the backup option.",
  backup_code_error_hint:
    'To use a backup code, you need at least one more MFA method for successful user authentication.',
  policy: 'Policy',
  policy_description: 'Set the MFA policy for sign-in and sign-up flows.',
  two_step_sign_in_policy: '2-step verification policy at sign-in',
  user_controlled: 'Users can enable or disable MFA on their own',
  user_controlled_tip:
    'Users can skip the MFA set-up the first time at sign-in or sign-up, or enable/disable it in account settings.',
  mandatory: 'Users are always required to use MFA at sign-in',
  mandatory_tip:
    'Users must set up MFA the first time at sign-in or sign-up, and use it for all future sign-ins.',
};

export default Object.freeze(mfa);
