const jwt_claims = {
  /** UNTRANSLATED */
  title: 'Custom JWT',
  /** UNTRANSLATED */
  description:
    'Set up custom JWT claims to include in the access token. These claims can be used to pass additional information to your application.',
  user_jwt: {
    /** UNTRANSLATED */
    card_title: 'For user',
    /** UNTRANSLATED */
    card_field: 'User access token',
    /** UNTRANSLATED */
    card_description: 'Add user-specific data during access token issuance.',
    /** UNTRANSLATED */
    for: 'for user',
  },
  machine_to_machine_jwt: {
    /** UNTRANSLATED */
    card_title: 'For M2M',
    /** UNTRANSLATED */
    card_field: 'Machine-to-machine token',
    /** UNTRANSLATED */
    card_description: 'Add extra data during machine-to-machine token issuance.',
    /** UNTRANSLATED */
    for: 'for M2M',
  },
  /** UNTRANSLATED */
  code_editor_title: 'Customize the {{token}} claims',
  /** UNTRANSLATED */
  custom_jwt_create_button: 'Add custom claims',
  /** UNTRANSLATED */
  custom_jwt_item: 'Custom claims {{for}}',
  /** UNTRANSLATED */
  delete_modal_title: 'Delete custom claims',
  /** UNTRANSLATED */
  delete_modal_content: 'Are you sure you want to delete the custom claims?',
  /** UNTRANSLATED */
  clear: 'Clear',
  /** UNTRANSLATED */
  cleared: 'Cleared',
  /** UNTRANSLATED */
  restore: 'Restore defaults',
  /** UNTRANSLATED */
  restored: 'Restored',
  /** UNTRANSLATED */
  data_source_tab: 'Data source',
  /** UNTRANSLATED */
  test_tab: 'Test context',
  /** UNTRANSLATED */
  jwt_claims_description: 'Default claims are auto-included in the JWT and cannot be overridden.',
  user_data: {
    /** UNTRANSLATED */
    title: 'User data',
    /** UNTRANSLATED */
    subtitle: 'Use `data.user` input parameter to provide vital user info.',
  },
  token_data: {
    /** UNTRANSLATED */
    title: 'Token data',
    /** UNTRANSLATED */
    subtitle: 'Use `token` input parameter for current access token payload. ',
  },
  fetch_external_data: {
    /** UNTRANSLATED */
    title: 'Fetch external data',
    /** UNTRANSLATED */
    subtitle: 'Incorporate data from your external APIs directly into claims.',
    /** UNTRANSLATED */
    description:
      'Use the `fetch` function to call your external APIs and include the data in your custom claims. Example: ',
  },
  environment_variables: {
    /** UNTRANSLATED */
    title: 'Set environment variables',
    /** UNTRANSLATED */
    subtitle: 'Use environment variables to store sensitive information.',
    /** UNTRANSLATED */
    input_field_title: 'Add environment variables',
    /** UNTRANSLATED */
    sample_code: 'Accessing environment variables in your custom JWT claims handler. Example: ',
  },
  /** UNTRANSLATED */
  jwt_claims_hint:
    'Limit custom claims to under 50KB. Default JWT claims are automatically included in the token and can not be overridden.',
  tester: {
    /** UNTRANSLATED */
    subtitle: 'Adjust mock token and user data for testing.',
    /** UNTRANSLATED */
    run_button: 'Run test',
    /** UNTRANSLATED */
    result_title: 'Test result',
  },
  form_error: {
    /** UNTRANSLATED */
    invalid_json: 'Invalid JSON format',
  },
};

export default Object.freeze(jwt_claims);
