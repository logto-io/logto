const jwt_claims = {
  title: 'Custom JWT',
  description:
    'Set up custom JWT claims to include in the access token. These claims can be used to pass additional information to your application.',
  user_jwt: {
    card_title: 'For user',
    card_field: 'User access token',
    card_description: 'Add user-specific data during access token issuance.',
    for: 'for user',
  },
  machine_to_machine_jwt: {
    card_title: 'For M2M',
    card_field: 'Machine-to-machine token',
    card_description: 'Add extra data during machine-to-machine token issuance.',
    for: 'for M2M',
  },
  code_editor_title: 'Customize the {{token}} claims',
  custom_jwt_create_button: 'Add custom claims',
  custom_jwt_item: 'Custom claims {{for}}',
  delete_modal_title: 'Delete custom claims',
  delete_modal_content: 'Are you sure you want to delete the custom claims?',
  clear: 'Clear',
  cleared: 'Cleared',
  restore: 'Restore defaults',
  restored: 'Restored',
  data_source_tab: 'Data source',
  test_tab: 'Test context',
  jwt_claims_description: 'Default claims are auto-included in the JWT and cannot be overridden.',
  user_data: {
    title: 'User data',
    subtitle: 'Use `data.user` input parameter to provide vital user info.',
  },
  token_data: {
    title: 'Token data',
    subtitle: 'Use `token` input parameter for current access token payload. ',
  },
  fetch_external_data: {
    title: 'Fetch external data',
    subtitle: 'Incorporate data from your external APIs directly into claims.',
    description:
      'Use the `fetch` function to call your external APIs and include the data in your custom claims. Example: ',
  },
  environment_variables: {
    title: 'Set environment variables',
    subtitle: 'Use environment variables to store sensitive information.',
    input_field_title: 'Add environment variables',
    sample_code: 'Accessing environment variables in your custom JWT claims handler. Example: ',
  },
  jwt_claims_hint:
    'Limit custom claims to under 50KB. Default JWT claims are automatically included in the token and can not be overridden.',
  tester: {
    subtitle: 'Adjust mock token and user data for testing.',
    run_button: 'Run test',
    result_title: 'Test result',
  },
  form_error: {
    invalid_json: 'Invalid JSON format',
  },
};

export default Object.freeze(jwt_claims);
