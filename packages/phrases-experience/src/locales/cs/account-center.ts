const account_center = {
  header: {
    title: 'Account center',
  },
  home: {
    title: 'Page not found',
    description: 'This page is not available.',
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
    error_failed: 'Verification failed. Please check your password.',
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
  password: {
    title: 'Set password',
    description: 'Create a new password to secure your account.',
    success: 'Password updated successfully.',
  },

  code_verification: {
    send: 'Send verification code',
    resend: 'Not received yet? <a>Resend verification code</a>',
    resend_countdown: 'Not received yet?<span> Resend after {{seconds}}s.</span>',
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
    resend_countdown: 'Not received yet?<span> Resend after {{seconds}}s.</span>',
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
    resend_countdown: 'Not received yet?<span> Resend after {{seconds}}s.</span>',
    error_send_failed: 'Failed to send verification code. Please try again later.',
    error_verify_failed: 'Verification failed. Please enter the code again.',
    error_invalid_code: 'The verification code is invalid or has expired.',
  },
  mfa: {
    totp_already_added:
      'You have already added an authenticator app. Please remove the existing one first.',
    totp_not_enabled:
      'Authenticator app is not enabled. Please contact your administrator to enable it.',
    backup_code_already_added:
      'You already have active backup codes. Please use or remove them before generating new ones.',
    backup_code_not_enabled:
      'Backup code is not enabled. Please contact your administrator to enable it.',
    backup_code_requires_other_mfa: 'Backup codes require another MFA method to be set up first.',
    passkey_not_enabled: 'Passkey is not enabled. Please contact your administrator to enable it.',
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
    backup_code: {
      title: 'Backup codes generated!',
      description: 'Your backup codes have been saved. Keep them in a safe place.',
    },
    backup_code_deleted: {
      title: 'Backup codes removed!',
      description: 'Your backup codes have been removed from your account.',
    },
    passkey: {
      title: 'Passkey added!',
      description: 'Your passkey has been successfully linked to your account.',
    },
    passkey_deleted: {
      title: 'Passkey removed!',
      description: 'Your passkey has been removed from your account.',
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
    delete_confirmation_title: 'Remove your backup codes',
    delete_confirmation_description:
      'If you remove these backup codes, you will not be able to verify with it.',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Added: {{date}}',
    last_used: 'Last used: {{date}}',
    never_used: 'Never',
    unnamed: 'Unnamed passkey',
    renamed: 'Passkey renamed successfully.',
    add_another_title: 'Add another passkey',
    add_another_description:
      'Register your passkey using device biometrics, security keys (e.g., YubiKey), or other available methods.',
    add_passkey: 'Add a passkey',
    delete_confirmation_title: 'Remove passkey',
    delete_confirmation_description:
      'Are you sure you want to remove "{{name}}"? You will no longer be able to use this passkey to sign in.',
    rename_passkey: 'Rename passkey',
    rename_description: 'Enter a new name for this passkey.',
  },
};

export default Object.freeze(account_center);
