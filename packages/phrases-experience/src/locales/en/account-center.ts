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
  },
};

export default Object.freeze(account_center);
