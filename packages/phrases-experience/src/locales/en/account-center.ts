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
    title: 'Link phone',
    description: 'Link your phone number to sign in or help with account recovery.',
    verification_title: 'Enter phone verification code',
    verification_description: 'The verification code has been sent to your phone {{phone_number}}.',
    success: 'Primary phone linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  code_verification: {
    send: 'Send verification code',
    resend: 'Resend code',
    resend_countdown: 'Not received yet? Resend after {{seconds}}s.',
  },

  email_verification: {
    title: 'Verify your email',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
    description:
      'The verification code has been sent to your email {{email}}. Enter the code to continue.',
    resend: 'Resend code',
    resend_countdown: 'Not received yet? Resend after {{seconds}}s.',
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
    resend: 'Resend code',
    resend_countdown: 'Not received yet? Resend after {{seconds}}s.',
    error_send_failed: 'Failed to send verification code. Please try again later.',
    error_verify_failed: 'Verification failed. Please enter the code again.',
    error_invalid_code: 'The verification code is invalid or has expired.',
  },
};

export default Object.freeze(account_center);
