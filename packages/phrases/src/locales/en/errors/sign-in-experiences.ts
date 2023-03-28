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
};

export default sign_in_experiences;
