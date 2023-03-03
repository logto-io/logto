const profile = {
  title: 'Account Settings',
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
  },
  password: {
    title: 'PASSWORD & SECURITY',
    password: 'Password',
    password_setting: 'Password setting',
    new_password: 'New password',
    confirm_password: 'Confirm password',
    enter_password: 'Enter password',
    enter_password_subtitle: 'Verify it’s you to protect your account security.',
    set_password: 'Set password',
    verify_via_password: 'Verify via password',
    show_password: 'Show password',
    required: 'Password is required',
    min_length: 'Password requires a minimum of {{min}} characters',
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
    dialog_paragraph_1:
      "We're sorry to hear that you want to delete your account. Deleting your account will permanently remove all data, including user information, logs, and settings, and this action cannot be undone. So please make sure to backup any important data before proceeding.",
    dialog_paragraph_2:
      'To proceed with the account deletion process, please email our support team at <a>{{mail}}</a> with the subject “Account Deletion Request”. We will assist you and ensure that all of your data is properly deleted from our system.',
    dialog_paragraph_3:
      'Thank you for choosing Logto Cloud. If you have any further questions or concerns, please do not hesitate to reach out to us.',
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
  email_changed: 'Email changed!',
  password_changed: 'Password changed!',
  updated: '{{target}} updated!',
  linked: '{{target}} linked!',
  unlinked: '{{target}} unlinked!',
};

export default profile;
