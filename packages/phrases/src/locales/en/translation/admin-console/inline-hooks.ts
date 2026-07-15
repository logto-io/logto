const inline_hooks = {
  page_title: 'Inline hooks',
  title: 'Inline hooks',
  subtitle:
    'Run custom code at specific points in the authentication flow to extend Logto behavior.',
  status: {
    not_configured: 'Not configured',
    configured: 'Configured',
    enabled: 'Enabled',
    disabled: 'Disabled',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'Post first-factor verification',
      description:
        'Run custom logic after the first authentication factor is verified and before sign-in continues.',
    },
    post_sign_in: {
      name: 'Post sign-in',
      description: 'Run custom logic after a user signs in successfully.',
    },
  },
};

export default Object.freeze(inline_hooks);
