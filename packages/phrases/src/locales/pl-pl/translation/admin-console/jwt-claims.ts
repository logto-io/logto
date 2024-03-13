const jwt_claims = {
  /** UNTRANSLATED */
  title: 'JWT claims',
  /** UNTRANSLATED */
  description:
    'Set up custom JWT claims to include in the access token. These claims can be used to pass additional information to your application.',
  /** UNTRANSLATED */
  user_jwt_tab: 'User JWT',
  /** UNTRANSLATED */
  machine_to_machine_jwt_tab: 'Machine-to-machine JWT',
  /** UNTRANSLATED */
  user_jwt: 'user JWT',
  /** UNTRANSLATED */
  machine_to_machine_jwt: 'machine-to-machine JWT',
  /** UNTRANSLATED */
  code_editor_title: 'Customize the {{token}} claims',
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
