const jwt_claims = {
  title: 'Custom JWT',
  description:
    'Customize access token or ID token, providing extra information to your application.',
  access_token: {
    card_title: 'Access token',
    card_description:
      'Access token is the credential used by APIs to authorize requests, containing only the necessary claims for access decisions.',
  },
  user_jwt: {
    card_field: 'User access token',
    card_description: 'Add user-specific data during access token issuance.',
    for: 'for user',
  },
  machine_to_machine_jwt: {
    card_field: 'Machine-to-machine access token',
    card_description: 'Add extra data during machine-to-machine token issuance.',
    for: 'for M2M',
  },
  id_token: {
    card_title: 'ID token',
    card_description:
      'ID token is an identity assertion received after sign-in, containing user identity claims for the client to use for display or session creation.',
    card_field: 'User ID token',
    card_field_description:
      "Claims 'sub', 'email', 'phone', 'profile', and 'address' are always available. Other claims must be enabled here first. In all cases, your app must request the matching scopes during integration to receive them.",
  },
  code_editor_title: 'Customize the {{token}} claims',
  custom_jwt_create_button: 'Add custom claims',
  custom_jwt_item: 'Custom claims {{for}}',
  delete_modal_title: 'Delete custom claims',
  delete_modal_content: 'Are you sure you want to delete the custom claims?',
  clear: 'Start over',
  cleared: 'Cleared',
  restore: 'Restore defaults',
  restored: 'Restored',
  data_source_tab: 'Data source',
  test_tab: 'Test context',
  jwt_claims_description: 'Default claims are auto-included in the  and cannot be overridden.',
  user_data: {
    title: 'User context',
    subtitle: 'Use `context.user` input parameter to provide vital user info.',
  },
  grant_data: {
    title: 'Grant context',
    subtitle:
      'Use `context.grant` input parameter to provide vital grant info, only available for token exchange.',
  },
  interaction_data: {
    title: 'User interaction context',
    subtitle:
      "Use the `context.interaction` parameter to access the user's interaction details for the current authentication session.",
  },
  application_data: {
    title: 'Application context',
    subtitle:
      'Use `context.application` input parameter to provide the application info associated with the token.',
  },
  token_data: {
    title: 'Token payload',
    subtitle: 'Use `token` input parameter for current access token payload. ',
  },
  api_context: {
    title: 'API context: access control',
    subtitle: 'Use `api.denyAccess` method to reject the token request.',
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
    sample_code: 'Accessing environment variables in your custom token claims handler. Example: ',
  },
  jwt_claims_hint:
    'Limit custom claims to under 50KB. Default token claims are automatically included in the token and can not be overridden.',
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
