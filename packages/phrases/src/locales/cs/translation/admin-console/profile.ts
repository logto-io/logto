const profile = {
  page_title: 'Account settings',
  title: 'Account settings',
  description:
    'Change your account settings and manage your personal information here to ensure your account security.',
  settings: {
    title: 'PROFILE SETTINGS',
    profile_information: 'Profile information',
    avatar: 'Avatar',
    name: 'Name',
    username: 'Username',
  },
  link_account: {
    title: 'LINK ACCOUNT',
    email_sign_in: 'Email sign-In',
    email: 'Email',
    social_sign_in: 'Social sign-In',
    link_email: 'Link email',
    link_email_subtitle: 'Link your email to sign in or help with account recovery.',
    email_required: 'Email is required',
    invalid_email: 'Invalid email address',
    identical_email_address: 'The input email address is identical to the current one',
    anonymous: 'Anonymous',
  },
  password: {
    title: 'PASSWORD & SECURITY',
    password: 'Password',
    password_setting: 'Password setting',
    new_password: 'New password',
    confirm_password: 'Confirm password',
    enter_password: 'Enter current password',
    enter_password_subtitle:
      "Verify it's you to protect your account security. Please enter your current password before changing it.",
    set_password: 'Set password',
    verify_via_password: 'Verify via password',
    show_password: 'Show password',
    required: 'Password is required',
    do_not_match: 'Passwords do not match. Please try again.',
  },
  code: {
    enter_verification_code: 'Enter verification code',
    enter_verification_code_subtitle:
      'The verification code has been sent to <strong>{{target}}</strong>',
    verify_via_code: 'Verify via verification code',
    resend: 'Resend verification code',
    resend_countdown: 'Resend in {{countdown}} seconds',
  },
  delete_account: {
    title: 'DELETE ACCOUNT',
    label: 'Delete account',
    description:
      'Deleting your account will remove all of your personal information, user data, and configuration. This action cannot be undone.',
    button: 'Delete account',
    p: {
      has_issue:
        "We're sorry to hear that you want to delete your account. Before you can delete your account, you need to resolve the following issues.",
      after_resolved:
        'Once you have resolved the issues, you can delete your account. Please do not hesitate to contact us if you need any assistance.',
      check_information:
        "We're sorry to hear that you want to delete your account. Please check the following information carefully before you proceed.",
      remove_all_data:
        'Deleting your account will permanently remove all data about you in Logto Cloud. So please make sure to backup any important data before proceeding.',
      confirm_information:
        'Please confirm that the information above is what you expected. Once you delete your account, we will not be able to recover it.',
      has_admin_role:
        'Since you have the admin role in the following tenant, it will be deleted along with your account:',
      has_admin_role_other:
        'Since you have the admin role in the following tenants, they will be deleted along with your account:',
      quit_tenant: 'You are about to quit the following tenant:',
      quit_tenant_other: 'You are about to quit the following tenants:',
    },
    issues: {
      paid_plan: 'The following tenant has a paid plan, please cancel the subscription first:',
      paid_plan_other:
        'The following tenants have paid plans, please cancel the subscription first:',
      subscription_status: 'The following tenant has a subscription status issue:',
      subscription_status_other: 'The following tenants have subscription status issues:',
      open_invoice: 'The following tenant has an open invoice:',
      open_invoice_other: 'The following tenants have open invoices:',
    },
    error_occurred: 'An error occurred',
    error_occurred_description: 'Sorry, something went wrong while deleting your account:',
    request_id: 'Request ID: {{requestId}}',
    try_again_later:
      'Please try again later. If the problem persists, please contact Logto team with the request ID.',
    final_confirmation: 'Final confirmation',
    about_to_start_deletion:
      'You are about to start the deletion process and this action cannot be undone.',
    permanently_delete: 'Permanently delete',
  },
  set: 'Set',
  change: 'Change',
  link: 'Link',
  unlink: 'Unlink',
  not_set: 'Not set',
  change_avatar: 'Change avatar',
  change_name: 'Change name',
  change_username: 'Change username',
  set_name: 'Set name',
  email_changed: 'Email changed.',
  password_changed: 'Password changed.',
  updated: '{{target}} updated.',
  linked: '{{target}} linked.',
  unlinked: '{{target}} unlinked.',
  email_exists_reminder:
    'This email {{email}} is associated with an existing account. Link another email here.',
  unlink_confirm_text: 'Yes, unlink',
  unlink_reminder:
    'Users will not be able to sign in with the <span></span> account if you unlink it. Are you sure to proceed?',
  fields: {
    name: 'Name',
    name_description:
      "The user's full name in displayable form including all name components (e.g., “Jane Doe”).",
    avatar: 'Avatar',
    avatar_description: "URL of the user's avatar image.",
    familyName: 'Last name',
    familyName_description: 'The user\'s surname(s) or last name(s) (e.g., "Doe").',
    givenName: 'First name',
    givenName_description: 'The user\'s given name(s) or first name(s) (e.g., "Jane").',
    middleName: 'Middle name',
    middleName_description: 'The user\'s middle name(s) (e.g., "Marie").',
    nickname: 'Nickname',
    nickname_description:
      'Casual or familiar name for the user, which may differ from their legal name.',
    preferredUsername: 'Preferred username',
    preferredUsername_description:
      'Shorthand identifier by which the user wishes to be referenced.',
    profile: 'Profile',
    profile_description:
      "URL of the user's human-readable profile page (e.g., social media profile).",
    website: 'Website',
    website_description: "URL of the user's personal website or blog.",
    gender: 'Gender',
    gender_description: 'The user\'s self-identified gender (e.g., "Female", "Male", "Non-binary")',
    birthdate: 'Birthdate',
    birthdate_description: 'The user\'s date of birth in a specified format (e.g., "MM-dd-yyyy").',
    zoneinfo: 'Timezone',
    zoneinfo_description:
      'The user\'s timezone in IANA format (e.g., "America/New_York" or "Europe/Paris").',
    locale: 'Language',
    locale_description: 'The user\'s language in IETF BCP 47 format (e.g., "en-US" or "zh-CN").',
    address: {
      formatted: 'Address',
      streetAddress: 'Street address',
      locality: 'City',
      region: 'State',
      postalCode: 'Zip code',
      country: 'Country',
    },
    address_description:
      'The user\'s full address in displayable form including all address components (e.g., "123 Main St, Anytown, USA 12345").',
    fullname: 'Fullname',
    fullname_description:
      'Flexibly combines familyName, givenName, and middleName based on configuration.',
  },
};

export default Object.freeze(profile);
