const jwt_claims = {
  /** UNTRANSLATED */
  title: 'JWT claims',
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
    card_description: 'Add extra data fro machine-to-machine communication.',
    /** UNTRANSLATED */
    for: 'for M2M',
  },
  /** UNTRANSLATED */
  code_editor_title: 'Customize the {{token}} claims',
  /** UNTRANSLATED */
  custom_jwt_create_button: 'Create custom claims',
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
  test_tab: 'Test claim',
  /** UNTRANSLATED */
  jwt_claims_description:
    'Handler that will be called during the access token generation process to add custom claims to the token. The function should return an object with the custom claims.',
  user_data: {
    /** UNTRANSLATED */
    title: 'User data',
    /** UNTRANSLATED */
    subtitle:
      'Input parameter `data.user`, providing essential user information linked to the present access token.',
  },
  token_data: {
    /** UNTRANSLATED */
    title: 'Token data',
    /** UNTRANSLATED */
    subtitle:
      'Input parameter `token`, providing the payload of the current access token for contextual reference.',
  },
  fetch_external_data: {
    /** UNTRANSLATED */
    title: 'Fetch external data',
    /** UNTRANSLATED */
    subtitle: 'Incorporate data sources from your external APIs directly into your custom claims.',
    /** UNTRANSLATED */
    description:
      'Use the `fetch` function to call your external APIs and include the data in your custom claims. Example: ',
  },
  environment_variables: {
    /** UNTRANSLATED */
    title: 'Set environment variables',
    /** UNTRANSLATED */
    subtitle:
      'Use environment variables to store sensitive information and access them in your custom claims handler.',
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
    title: 'Test',
    /** UNTRANSLATED */
    subtitle: "Edit the context to adjust the token's request states and test your custom claims.",
    /** UNTRANSLATED */
    run_button: 'Run',
    /** UNTRANSLATED */
    result_title: 'Test result',
  },
  form_error: {
    /** UNTRANSLATED */
    invalid_json: 'Invalid JSON format',
  },
};

export default Object.freeze(jwt_claims);
