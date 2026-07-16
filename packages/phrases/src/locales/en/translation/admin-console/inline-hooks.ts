const inline_hooks = {
  page_title: 'Inline hooks',
  title: 'Inline hooks',
  subtitle:
    'Run custom code at specific points in the authentication flow to extend Logto behavior.',
  details_page_title: '{{name}}',
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
  settings: {
    title: 'Settings',
    enabled: {
      title: 'Enable hook',
      description: 'Run this script when the authentication event is triggered.',
    },
    on_execution_error: {
      title: 'On script error',
      description: 'Choose how Logto should behave when the script fails at runtime.',
      block: 'Block the authentication flow',
      allow: 'Allow the authentication flow to continue',
    },
    environment_variables: {
      title: 'Environment variables',
      subtitle: 'Store secrets and configuration values used by the script.',
      input_field_title: 'Add environment variables',
      sample_code: 'Access environment variables in your hook script. Example:',
    },
    context_sample: {
      title: 'Event sample',
      subtitle: 'Mock event payload used as the `event` argument of `runInlineHook`.',
      input_field_title: 'Event sample JSON',
    },
  },
  script: {
    title: 'Script',
    restore: 'Restore defaults',
    restored: 'Restored',
  },
  tester: {
    run_button: 'Run test',
    result_title: 'Test result',
  },
  form_error: {
    invalid_json: 'Invalid JSON format',
  },
  security_warning: {
    title: 'Security warning',
    description:
      'Users provisioned by this hook bypass registration-only guards, including email blocklist, SSO-only domain, sign-up-disabled mode, and registration mandatory-profile checks. Existing-user profile and password writes also occur before MFA completes.',
  },
  delete_modal_title: 'Delete inline hook',
  delete_modal_content:
    'Are you sure you want to delete this inline hook? The authentication flow will no longer run this script.',
  deleted: 'Inline hook deleted',
  created: 'Inline hook created',
  saved: 'Inline hook saved',
};

export default Object.freeze(inline_hooks);
