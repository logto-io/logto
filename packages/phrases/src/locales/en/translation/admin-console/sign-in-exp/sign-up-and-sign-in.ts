const sign_up_and_sign_in = {
  identifiers_email: 'Email address',
  identifiers_phone: 'Phone number',
  identifiers_username: 'Username',
  identifiers_email_or_sms: 'Email address or phone number',
  identifiers_none: 'Not applicable',
  and: 'and',
  or: 'or',
  sign_up: {
    title: 'SIGN UP',
    sign_up_identifier: 'Sign-up identifier',
    identifier_description:
      'The sign-up identifier is required for account creation and must be included in your sign-in screen.',
    sign_up_authentication: 'Authentication setting for sign-up',
    authentication_description:
      'All selected actions will be obligatory for users to complete the flow.',
    set_a_password_option: 'Create your password',
    verify_at_sign_up_option: 'Verify at sign-up',
    social_only_creation_description: '(This apply to social only account creation)',
  },
  sign_in: {
    title: 'SIGN IN',
    sign_in_identifier_and_auth: 'Identifier and authentication settings for sign-in',
    description:
      'Users can sign in using any of the options available. Adjust the layout by drag and dropping below options.',
    add_sign_in_method: 'Add sign-in method',
    password_auth: 'Password',
    verification_code_auth: 'Verification code',
    auth_swap_tip: 'Swap the options below to determine which appears first in the flow.',
    require_auth_factor: 'You have to select at least one authentication factor.',
  },
  social_sign_in: {
    title: 'SOCIAL SIGN-IN',
    social_sign_in: 'Social sign-in',
    description:
      'Depending on the mandatory identifier you set up, your user may be asked to provide an identifier when signing up via social connector.',
    add_social_connector: 'Add Social Connector',
    set_up_hint: {
      not_in_list: 'Not in the list?',
      set_up_more: 'Set up',
      go_to: 'other social connectors now.',
    },
    automatic_account_linking: 'Automatic account linking',
    automatic_account_linking_label:
      'When switched on, if a user signs in with a social identity that is new to the system, and there is exactly one existing account with the same identifier (e.g., email), Logto will automatically link the account with the social identity instead of prompting the user for account linking.',
  },
  tip: {
    set_a_password: 'A unique set of a password to your username is a must.',
    verify_at_sign_up:
      'We currently only support verified email. Your user base may contain a large number of poor-quality email addresses if no validation.',
    password_auth:
      'This is essential as you have enabled the option to set a password during the sign-up process.',
    verification_code_auth:
      'This is essential as you have only enabled the option to provide verification code when signing up. You’re free to uncheck the box when password set-up is allowed at the sign-up process.',
    delete_sign_in_method:
      'This is essential as you have selected {{identifier}} as a required identifier.',
  },
  advanced_options: {
    title: 'ADVANCED OPTIONS',
    enable_single_sign_on: 'Enable enterprise Single Sign-On (SSO)',
    enable_single_sign_on_description:
      'Enable users to sign-in to the application using Single Sign-On with their enterprise identities.',
    single_sign_on_hint: {
      prefix: 'Go to ',
      link: '"Enterprise SSO"',
      suffix: 'section to set up more enterprise connectors.',
    },
    enable_user_registration: 'Enable user registration',
    enable_user_registration_description:
      'Enable or disallow user registration. Once disabled, users can still be added in the admin console but users can no longer establish accounts through the sign-in UI.',
  },
};

export default Object.freeze(sign_up_and_sign_in);
