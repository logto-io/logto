const description = {
  email: 'email',
  phone_number: 'phone number',
  username: 'username',
  reminder: 'Reminder',
  not_found: '404 Not Found',
  agree_with_terms: 'I have read and agree to the ',
  agree_with_terms_modal: 'To proceed, please agree to the <link></link>.',
  terms_of_use: 'Terms of Use',
  sign_in: 'Sign in',
  privacy_policy: 'Privacy Policy',
  create_account: 'Create account',
  switch_account: 'Switch account',
  or: 'or',
  and: 'and',
  enter_passcode: 'The verification code has been sent to your {{address}} {{target}}',
  passcode_sent: 'The verification code has been resent',
  resend_after_seconds: 'Not received yet? Resend after <span>{{seconds}}</span> seconds',
  resend_passcode: 'Not received yet? <a>Resend verification code</a>',
  create_account_id_exists:
    'The account with {{type}} {{value}} already exists, would you like to sign in?',
  link_account_id_exists:
    'The account with {{type}} {{value}} already exists. Would you like to link?',
  sign_in_id_does_not_exist:
    'The account with {{type}} {{value}} does not exist, would you like to create a new account?',
  sign_in_id_does_not_exist_alert: 'The account with {{type}} {{value}} does not exist.',
  create_account_id_exists_alert:
    'The account with {{type}} {{value}} is linked to another account. Please try another {{type}}.',
  social_identity_exist:
    'The {{type}} {{value}} is linked to another account. Please try another {{type}}.',
  bind_account_title: 'Link or create account',
  social_create_account: 'You can create a new account.',
  social_link_email: 'You can link another email',
  social_link_phone: 'You can link another phone',
  social_link_email_or_phone: 'You can link another email or phone',
  social_bind_with_existing:
    'We found a related account which had been registered, and you can link it directly.',
  skip_social_linking: 'Skip linking to existing account?',
  reset_password: 'Reset password',
  reset_password_description:
    'Enter the {{types, list(type: disjunction;)}} associated with your account, and we’ll send you the verification code to reset your password.',
  new_password: 'New password',
  set_password: 'Set password',
  password_changed: 'Password changed',
  no_account: 'No account yet? ',
  have_account: 'Already had an account?',
  enter_password: 'Enter password',
  enter_password_for: 'Sign in with the password to {{method}} {{value}}',
  enter_username: 'Set username',
  enter_username_description:
    'Username is an alternative for sign-in. Username should contain only letters, numbers, and underscores.',
  link_email: 'Link email',
  link_phone: 'Link phone',
  link_email_or_phone: 'Link email or phone',
  link_email_description: 'For added security, please link your email with the account.',
  link_phone_description: 'For added security, please link your phone with the account.',
  link_email_or_phone_description:
    'For added security, please link your email or phone with the account.',
  continue_with_more_information: 'For added security, please complete below account details.',
  create_your_account: 'Create your account',
  sign_in_to_your_account: 'Sign in to your account',
  no_region_code_found: 'No region code found',
  verify_email: 'Verify your email',
  verify_phone: 'Verify your phone number',
  password_requirements: 'Password {{items, list}}.',
  password_requirement: {
    length_one: 'requires a minimum of {{count}} character',
    length_two: 'requires a minimum of {{count}} characters',
    length_few: 'requires a minimum of {{count}} characters',
    length_many: 'requires a minimum of {{count}} characters',
    length_other: 'requires a minimum of {{count}} characters',
    character_types_one:
      'should contain at least {{count}} type of uppercase letters, lowercase letters, digits, and symbols',
    character_types_two:
      'should contain at least {{count}} types of uppercase letters, lowercase letters, digits, and symbols',
    character_types_few:
      'should contain at least {{count}} types of uppercase letters, lowercase letters, digits, and symbols',
    character_types_many:
      'should contain at least {{count}} types of uppercase letters, lowercase letters, digits, and symbols',
    character_types_other:
      'should contain at least {{count}} types of uppercase letters, lowercase letters, digits, and symbols',
  },
  use: 'Use',
  single_sign_on_email_form: 'Enter your enterprise email address',
  single_sign_on_connectors_list:
    'Your enterprise has enabled Single Sign-On for the email account {{email}}. You can continue to sign in with the following SSO providers.',
  single_sign_on_enabled: 'Single Sign-On is enabled for this account',
  authorize_title: 'Authorize {{name}}',
  request_permission: '{{name}} is requesting access to:',
  grant_organization_access: 'Grant the organization access:',
  authorize_personal_data_usage: 'Authorize the use of your personal data:',
  authorize_organization_access: 'Authorize access to the specific organization:',
  user_scopes: 'Personal user data',
  organization_scopes: 'Organization access',
  authorize_agreement: `By authorizing the access, you agree to the {{name}}'s <link></link>.`,
  authorize_agreement_with_redirect: `By authorizing the access, you agree to the {{name}}'s <link></link>, and will be redirected to {{uri}}.`,
  not_you: 'Not you?',
  user_id: 'User ID: {{id}}',
  redirect_to: 'You will be redirected to {{name}}.',
  auto_agreement: 'By continuing, you agree to the <link></link>.',
  identifier_sign_in_description: 'Enter you {{types, list(type: disjunction;)}} to sign in.',
  all_sign_in_options: 'All sign-in options',
  identifier_register_description:
    'Enter you {{types, list(type: disjunction;)}} to create a new account.',
  all_account_creation_options: 'All account creation options',
  back_to_sign_in: 'Back to sign in',
  support_email: 'Support email: <link></link>',
  support_website: 'Support website: <link></link>',
  switch_account_title: 'You are currently signed in as {{account}}',
  switch_account_description:
    'To continue, you will be signed out of the current account, and switch to the new account automatically.',
};

export default Object.freeze(description);
