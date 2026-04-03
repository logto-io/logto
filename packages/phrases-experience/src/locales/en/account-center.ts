const account_center = {
  home: {
    title: 'Page not found',
    description: 'This page is not available.',
  },
  page: {
    title: 'Account',
    security_title: 'Security',
    security_description: 'Change your account settings here to ensure your account security.',
    support: 'Support',
  },
  verification: {
    title: 'Security verification',
    description:
      "Verify it's you to protect your account security. Please select the method to verify your identity.",
    error_send_failed: 'Failed to send verification code. Please try again later.',
    error_invalid_code: 'The verification code is invalid or has expired.',
    error_verify_failed: 'Verification failed. Please enter the code again.',
    verification_required: 'Verification expired. Please verify your identity again.',
    try_another_method: 'Try another method to verify',
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Incorrect password. Please check your input.',
  },
  verification_method: {
    password: {
      name: 'Password',
      description: 'Verify your password',
    },
    email: {
      name: 'Email verification code',
      description: 'Send verification code to your email',
    },
    phone: {
      name: 'Phone verification code',
      description: 'Send verification code to your phone number',
    },
  },
  email: {
    title: 'Link email',
    description: 'Link your email to sign in or help with account recovery.',
    verification_title: 'Enter email verification code',
    verification_description:
      'The verification code has been sent to your email {{email_address}}.',
    success: 'Primary email linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  phone: {
    title: 'Link phone number',
    description: 'Link your phone number to sign in or help with account recovery.',
    verification_title: 'Enter SMS verification code',
    verification_description: 'The verification code has been sent to your phone {{phone_number}}.',
    success: 'Primary phone linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  username: {
    title: 'Set username',
    description: 'Username must contain only letters, numbers, and underscores.',
    success: 'Username updated successfully.',
  },
  security: {
    add: 'Add',
    change: 'Change',
    remove: 'Remove',
    not_set: 'Not set',
    social_sign_in: 'Social sign-in',
    social_not_linked: 'Not linked',
    email_phone: 'Email / Phone',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
    configured: 'Configured',
    not_configured: 'Not configured',
    two_step_verification: '2-step verification',
    authenticator_app: 'Authenticator app',
    passkeys: 'Passkeys',
    backup_codes: 'Backup codes',
    email_verification_code: 'Email verification code',
    phone_verification_code: 'Phone verification code',
    passkeys_count_one: '{{count}} passkey',
    passkeys_count_other: '{{count}} passkeys',
    backup_codes_count_one: '{{count}} code remaining',
    backup_codes_count_other: '{{count}} codes remaining',
    view: 'View',
    manage: 'Manage',
    turn_on_2_step_verification: 'Turn on 2-step verification',
    turn_on_2_step_verification_description:
      "Add an extra layer of security. You'll be prompted for a second verification step at sign-in.",
    turn_off_2_step_verification: 'Turn off 2-step verification',
    turn_off_2_step_verification_description:
      'Disabling 2-step verification will remove the extra layer of protection from your account at sign-in. Are you sure you want to continue?',
    disable_2_step_verification: 'Disable 2-step verification',
    no_verification_method_warning:
      "You haven't added a second verification method. Add at least one to enable 2-step verification at sign-in.",
    account_removal: 'Account removal',
    delete_your_account: 'Delete your account',
    delete_account: 'Delete account',
  },
  social: {
    linked: '{{connector}} linked successfully.',
    removed: '{{connector}} removed successfully.',
    not_enabled:
      'This social sign-in method is not enabled. Please contact your administrator for assistance.',
    remove_confirmation_title: 'Remove social account',
    remove_confirmation_description:
      'If you remove {{connector}}, you may not be able to sign in with it until you add it back again.',
  },
  password: {
    title: 'Set password',
    description: 'Create a new password to secure your account.',
    success: 'Password updated successfully.',
  },

  code_verification: {
    send: 'Send verification code',
    resend: 'Not received yet? <a>Resend verification code</a>',
    resend_countdown: 'Not received yet? Resend after {{seconds}}s',
  },

  email_verification: {
    title: 'Verify your email',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
    description:
      'The verification code has been sent to your email {{email}}. Enter the code to continue.',
    resend: 'Not received yet? <a>Resend verification code</a>',
    not_received: 'Not received yet?',
    resend_action: 'Resend verification code',
    resend_countdown: 'Not received yet? Resend after {{seconds}}s',
    error_send_failed: 'Failed to send verification code. Please try again later.',
    error_verify_failed: 'Verification failed. Please enter the code again.',
    error_invalid_code: 'The verification code is invalid or has expired.',
  },
  phone_verification: {
    title: 'Verify your phone',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your phone.",
    phone_label: 'Phone number',
    send: 'Send verification code',
    description:
      'The verification code has been sent to your phone {{phone}}. Enter the code to continue.',
    resend: 'Not received yet? <a>Resend verification code</a>',
    resend_countdown: 'Not received yet? Resend after {{seconds}}s',
    error_send_failed: 'Failed to send verification code. Please try again later.',
    error_verify_failed: 'Verification failed. Please enter the code again.',
    error_invalid_code: 'The verification code is invalid or has expired.',
  },
  mfa: {
    totp_already_added:
      'You have already added an authenticator app. Please remove the existing one first.',
    totp_not_enabled:
      'Authenticator app OTP is not enabled. Please contact your administrator for assistance.',
    backup_code_already_added:
      'You already have active backup codes. Please use or remove them before generating new ones.',
    backup_code_not_enabled:
      'Backup code is not enabled. Please contact your administrator for assistance.',
    backup_code_requires_other_mfa: 'Backup codes require another MFA method to be set up first.',
    passkey_not_enabled:
      'Passkey is not enabled. Please contact your administrator for assistance.',
    passkey_already_registered:
      'This passkey is already registered to your account. Please use a different authenticator.',
  },
  update_success: {
    default: {
      title: 'Update successful',
      description: 'Your changes have been saved successfully.',
    },
    email: {
      title: 'Email address updated!',
      description: "Your account's email address has been successfully changed.",
    },
    phone: {
      title: 'Phone number updated!',
      description: "Your account's phone number has been successfully changed.",
    },
    username: {
      title: 'Username updated!',
      description: "Your account's username has been successfully changed.",
    },
    password: {
      title: 'Password updated!',
      description: "Your account's password has been successfully changed.",
    },
    totp: {
      title: 'Authenticator app added!',
      description: 'Your authenticator app has been successfully linked to your account.',
    },
    totp_replaced: {
      title: 'Authenticator app replaced!',
      description: 'Your authenticator app has been successfully replaced.',
    },
    backup_code: {
      title: 'Backup codes generated!',
      description: 'Your backup codes have been saved. Keep them in a safe place.',
    },
    passkey: {
      title: 'Passkey added!',
      description: 'Your passkey has been successfully linked to your account.',
    },
    social: {
      title: 'Social account linked!',
      description: 'Your social account has been successfully linked.',
    },
  },
  backup_code: {
    title: 'Backup codes',
    description:
      'You can use one of these backup codes to access your account if you have trouble during 2-step verification in another ways. Each code may be used only once.',
    copy_hint: 'Make sure copy them and save in a safe place.',
    generate_new_title: 'Generate new backup codes',
    generate_new: 'Generate new backup codes',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Added: {{date}}',
    last_used: 'Last used: {{date}}',
    never_used: 'Never',
    unnamed: 'Unnamed passkey',
    renamed: 'Passkey renamed successfully.',
    deleted: 'Passkey removed successfully.',
    add_another_title: 'Add another passkey',
    add_another_description:
      'Register your passkey using device biometrics, security keys (e.g., YubiKey), or other available methods.',
    add_passkey: 'Add a passkey',
    delete_confirmation_title: 'Remove your passkey',
    delete_confirmation_description:
      'If you remove this passkey, you will not be able to verify with it.',
    rename_passkey: 'Rename passkey',
    rename_description: 'Enter a new name for this passkey.',
    name_this_passkey: 'Name this device passkey',
    name_passkey_description:
      'You have successfully verified this device for 2-step authentication. Customize the name to recognize if you have multiple keys.',
    name_input_label: 'Name',
  },
};

export default Object.freeze(account_center);
