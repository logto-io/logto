const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    'Empty "Terms of use" content URL. Please add the content URL if "Terms of use" is enabled.',
  empty_social_connectors:
    'Empty social connectors. Please add enabled social connectors when the social sign-in method is enabled.',
  enabled_connector_not_found: 'Enabled {{type}} connector not found.',
  not_one_and_only_one_primary_sign_in_method:
    'There must be one and only one primary sign-in method. Please check your input.',
  username_requires_password: 'Must enable set a password for username sign up identifier.',
  passwordless_requires_verify: 'Must enable verify for email/phone sign up identifier.',
  miss_sign_up_identifier_in_sign_in: 'Sign in methods must contain the sign up identifier.',
  password_sign_in_must_be_enabled:
    'Password sign in must be enabled when set a password is required in sign up.',
  code_sign_in_must_be_enabled:
    'Verification code sign in must be enabled when set a password is not required in sign up.',
  unsupported_default_language: 'This language - {{language}} is not supported at the moment.',
  at_least_one_authentication_factor: 'You have to select at least one authentication factor.',
  backup_code_cannot_be_enabled_alone: 'Backup code cannot be enabled alone.',
  duplicated_mfa_factors: 'Duplicated MFA factors.',
  email_verification_code_cannot_be_used_for_mfa:
    'Email verification code cannot be used for MFA when email verification is enabled for sign-in.',
  phone_verification_code_cannot_be_used_for_mfa:
    'SMS verification code cannot be used for MFA when SMS verification is enabled for sign-in.',
  email_verification_code_cannot_be_used_for_sign_in:
    'Email verification code cannot be used for sign-in when it is enabled for MFA.',
  phone_verification_code_cannot_be_used_for_sign_in:
    'SMS verification code cannot be used for sign-in when it is enabled for MFA.',
  adaptive_mfa_requires_mfa: 'MFA must be enabled before enabling adaptive MFA.',
  adaptive_mfa_requires_non_skippable_policy:
    'Adaptive MFA requires a non-skippable MFA prompt policy. Use PromptOnlyAtSignInMandatory or PromptAtSignInAndSignUpMandatory.',
  non_adaptive_mfa_requires_skippable_policy:
    'When adaptive MFA is disabled, MFA prompt policy must be skippable. Do not use PromptOnlyAtSignInMandatory or PromptAtSignInAndSignUpMandatory.',
  duplicated_sign_up_identifiers: 'Duplicate sign-up identifiers detected.',
  missing_sign_up_identifiers: 'Primary sign-up identifier cannot be empty.',
  invalid_custom_email_blocklist_format:
    'Invalid custom email blocklist items: {{items, list(type:conjunction)}}. Each item must be a valid email address or email domain, e.g., foo@example.com or @example.com.',
  forgot_password_method_requires_connector:
    'Forgot password method requires a corresponding {{method}} connector to be configured.',
  password_expiration_not_enabled:
    'Password expiration policy is not enabled. Enable it in the sign-in experience settings before expiring passwords.',
  password_expiration_invalid_period_days:
    'Reminder period days must be less than valid period days when password expiration is enabled.',
};

export default Object.freeze(sign_in_experiences);
