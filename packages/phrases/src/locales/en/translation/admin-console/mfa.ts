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
  email_verification_code: 'Email verification code',
  email_verification_code_description:
    'Link email address to receive and verify verification codes.',
  phone_verification_code: 'SMS verification code',
  phone_verification_code_description:
    'Link phone number to receive and verify SMS verification codes.',
  policy: 'Policy',
  policy_description: 'Set the MFA policy for sign-in and sign-up flows.',
  two_step_sign_in_policy: '2-step verification policy at sign-in',
  user_controlled: 'Users can enable or disable MFA on their own',
  user_controlled_tip:
    'Users can skip the MFA set-up the first time at sign-in or sign-up, or enable/disable it in account settings.',
  mandatory: 'Users are always required to use MFA at sign-in',
  mandatory_tip:
    'Users must set up MFA the first time at sign-in or sign-up, and use it for all future sign-ins.',
  require_mfa: 'Require MFA',
  require_mfa_label:
    'Enable this to make 2-step verification mandatory for accessing your applications. If disabled, users can decide whether to enable MFA for themselves.',
  set_up_prompt: 'MFA set-up prompt',
  no_prompt: 'Do not ask users to set up MFA',
  prompt_at_sign_in_and_sign_up:
    'Ask users to set up MFA during registration (skippable, one-time prompt)',
  prompt_only_at_sign_in:
    'Ask users to set up MFA on their next sign-in attempt after registration (skippable, one-time prompt)',
  set_up_organization_required_mfa_prompt:
    'MFA setup prompt for users after organization enables MFA',
  prompt_at_sign_in_no_skip: 'Ask users to set up MFA on next sign-in (no skipping)',
  email_primary_method_tip:
    "Email verification code is already your primary sign-in method. To maintain security, it can't be reused for MFA.",
  phone_primary_method_tip:
    "SMS verification code is already your primary sign-in method. To maintain security, it can't be reused for MFA.",
  no_email_connector_warning:
    'No email connector set-up yet. Before completing the configuration, users will not be able to use email verification codes for MFA. <a>{{link}}</a> in "Connectors".',
  no_sms_connector_warning:
    'No SMS connector set-up yet. Before completing the configuration, users will not be able to use SMS verification codes for MFA. <a>{{link}}</a> in "Connectors".',
  no_email_connector_error:
    'Cannot enable email verification code MFA without an email connector. Please configure an email connector first.',
  no_sms_connector_error:
    'Cannot enable SMS verification code MFA without an SMS connector. Please configure an SMS connector first.',
  setup_link: 'Set up',
};

export default Object.freeze(mfa);
