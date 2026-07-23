const actions = {
  page_title: 'Actions',
  title: 'Actions',
  subtitle:
    'Run custom code at specific points in the authentication flow to extend Logto behavior.',
  status: {
    not_configured: 'Not configured',
    configured: 'Configured',
    enabled: 'Enabled',
    disabled: 'Disabled',
  },
  types: {
    post_first_factor_verification: {
      name: 'Post first-factor verification',
      description: 'Run custom logic after local password verification fails during sign-in.',
    },
    post_sign_in: {
      name: 'Post sign-in',
      description: 'Run custom logic after a user signs in successfully.',
    },
  },
  data_source_tab: 'Data source',
  test_tab: 'Test context',
  settings_tab: 'Settings',
  event_data: {
    title: 'Event payload',
    subtitle: 'Use the `event` input parameter for the authentication event data.',
  },
  result_data: {
    title: 'Action result',
    subtitle: 'Return a result object that Logto understands for this action type.',
  },
  environment_variables: {
    title: 'Set environment variables',
    subtitle: 'Use environment variables to store sensitive information.',
    input_field_title: 'Add environment variables',
    sample_code: 'Accessing environment variables in your action handler. Example:',
  },
  fetch_external_data: {
    title: 'Fetch external data',
    subtitle: 'Call external APIs from your action script.',
    description:
      'Use the `fetch` function to call your external APIs and include the data in the action result. Example:',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Control whether the action is active and how runtime errors are handled.',
    enabled: {
      title: 'Enable action',
      description: 'Run this script when the authentication event is triggered.',
    },
    on_execution_error: {
      title: 'On script error',
      description: 'Choose how Logto should behave when the script fails at runtime.',
      block: 'Block the authentication flow',
      allow: 'Allow the authentication flow to continue',
      post_first_factor_description:
        'When this script fails, Logto always rejects invalid credentials so password verification cannot be bypassed.',
    },
  },
  test_context: {
    subtitle: 'Adjust the mock event payload used when running tests.',
    input_field_title: 'Event sample JSON',
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
      'This action runs only after local password verification fails. Return `passwordVerified: true` only after independently verifying the submitted password. Users provisioned by this action bypass registration-only guards, including email blocklist, SSO-only domain, sign-up-disabled mode, and registration mandatory-profile checks. Existing-user profile and password writes also occur before MFA completes.',
  },
  delete_modal_title: 'Delete action',
  delete_modal_content:
    'Are you sure you want to delete this action? The authentication flow will no longer run this script.',
  deleted: 'Action deleted',
  created: 'Action created',
  saved: 'Action saved',
};

export default Object.freeze(actions);
