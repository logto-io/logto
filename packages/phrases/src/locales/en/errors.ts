const errors = {
  auth: {
    authorization_header_missing: 'Authorization header is missing.',
    authorization_token_type_not_supported: 'Authorization type is not supported.',
    unauthorized: 'Unauthorized. Please check credentials and its scope.',
    forbidden: 'Forbidden. Please check your user roles and permissions.',
    expected_role_not_found:
      'Expected role not found. Please check your user roles and permissions.',
    jwt_sub_missing: 'Missing `sub` in JWT.',
  },
  guard: {
    invalid_input: 'The request {{type}} is invalid.',
    invalid_pagination: 'The request pagination value is invalid.',
  },
  oidc: {
    aborted: 'The end-user aborted interaction.',
    invalid_scope: 'Scope {{scope}} is not supported.',
    invalid_scope_plural: 'Scope {{scopes}} are not supported.',
    invalid_token: 'Invalid token provided.',
    invalid_client_metadata: 'Invalid client metadata provided.',
    insufficient_scope: 'Access token missing requested scope {{scopes}}.',
    invalid_request: 'Request is invalid.',
    invalid_grant: 'Grant request is invalid.',
    invalid_redirect_uri:
      "`redirect_uri` did not match any of the client's registered `redirect_uris`.",
    access_denied: 'Access denied.',
    invalid_target: 'Invalid resource indicator.',
    unsupported_grant_type: 'Unsupported `grant_type` requested.',
    unsupported_response_mode: 'Unsupported `response_mode` requested.',
    unsupported_response_type: 'Unsupported `response_type` requested.',
    provider_error: 'OIDC Internal Error: {{message}}.',
  },
  user: {
    username_exists_register: 'The username has been registered.',
    email_exists_register: 'The email address has been registered.',
    phone_exists_register: 'The phone number has been registered.',
    invalid_email: 'Invalid email address.',
    invalid_phone: 'Invalid phone number.',
    email_not_exists: 'The email address has not been registered yet.',
    phone_not_exists: 'The phone number has not been registered yet.',
    identity_not_exists: 'The social account has not been registered yet.',
    identity_exists: 'The social account has been registered.',
    invalid_role_names: 'role names ({{roleNames}}) are not valid',
    cannot_delete_self: 'You cannot delete yourself.',
    same_password: 'Your new password can not be the same as current password.',
  },
  password: {
    unsupported_encryption_method: 'The encryption method {{name}} is not supported.',
    pepper_not_found: 'Password pepper not found. Please check your core envs.',
  },
  session: {
    not_found: 'Session not found. Please go back and sign in again.',
    invalid_credentials: 'Invalid credentials. Please check your input.',
    invalid_sign_in_method: 'Current sign-in method is not available.',
    invalid_connector_id: 'Unable to find available connector with id {{connectorId}}.',
    insufficient_info: 'Insufficient sign-in info.',
    connector_id_mismatch: 'The connectorId is mismatched with session record.',
    connector_session_not_found: 'Connector session not found. Please go back and sign in again.',
    forgot_password_session_not_found:
      'Forgot password session not found. Please go back and verify.',
    forgot_password_verification_expired:
      'Forgot password verification has expired. Please go back and verify again.',
    unauthorized: 'Please sign in first.',
    unsupported_prompt_name: 'Unsupported prompt name.',
  },
  connector: {
    general: 'An unexpected error occurred in connector.{{errorDescription}}',
    not_found: 'Cannot find any available connector for type: {{type}}.',
    not_enabled: 'The connector is not enabled.',
    invalid_metadata: "The connector's metadata is invalid.",
    invalid_config_guard: "The connector's config guard is invalid.",
    unexpected_type: "The connector's type is unexpected.",
    invalid_request_parameters: 'The request is with wrong input parameter(s).',
    insufficient_request_parameters: 'The request might miss some input parameters.',
    invalid_config: "The connector's config is invalid.",
    invalid_response: "The connector's response is invalid.",
    template_not_found: 'Unable to find correct template in connector config.',
    not_implemented: '{{method}}: has not been implemented yet.',
    social_invalid_access_token: "The connector's access token is invalid.",
    invalid_auth_code: "The connector's auth code is invalid.",
    social_invalid_id_token: "The connector's id token is invalid.",
    authorization_failed: "The user's authorization process is unsuccessful.",
    social_auth_code_invalid: 'Unable to get access token, please check authorization code.',
    more_than_one_sms: 'The number of SMS connectors is larger then 1.',
    more_than_one_email: 'The number of Email connectors is larger then 1.',
    db_connector_type_mismatch: 'There is a connector in the DB that does not match the type.',
  },
  passcode: {
    phone_email_empty: 'Both phone and email are empty.',
    not_found: 'Passcode not found. Please send passcode first.',
    phone_mismatch: 'Phone mismatch. Please request a new passcode.',
    email_mismatch: 'Email mismatch. Please request a new passcode.',
    code_mismatch: 'Invalid passcode.',
    expired: 'Passcode has expired. Please request a new passcode.',
    exceed_max_try: 'Passcode verification limitation exceeded. Please request a new passcode.',
  },
  sign_in_experiences: {
    empty_content_url_of_terms_of_use:
      'Empty "Terms of use" content URL. Please add the content URL if "Terms of use" is enabled.',
    empty_logo: 'Please enter your logo URL',
    empty_slogan:
      'Empty branding slogan. Please add a branding slogan if a UI style containing the slogan is selected.',
    empty_social_connectors:
      'Empty social connectors. Please add enabled social connectors when the social sign-in method is enabled.',
    enabled_connector_not_found: 'Enabled {{type}} connector not found.',
    not_one_and_only_one_primary_sign_in_method:
      'There must be one and only one primary sign-in method. Please check your input.',
    username_requires_password: 'Must enable set a password for username sign up identifier.',
    passwordless_requires_verify: 'Must enable verify for email/phone sign up identifier.',
  },
  localization: {
    cannot_delete_default_language:
      'You cannot delete {{languageKey}} language since it is used as default language in sign-in experience.', // UNTRANSLATED
  },
  swagger: {
    invalid_zod_type: 'Invalid Zod type. Please check route guard config.',
    not_supported_zod_type_for_params:
      'Not supported Zod type for the parameters. Please check route guard config.',
  },
  entity: {
    create_failed: 'Failed to create {{name}}.',
    not_exists: 'The {{name}} does not exist.',
    not_exists_with_id: 'The {{name}} with ID `{{id}}` does not exist.',
    not_found: 'The resource does not exist.',
  },
};

export default errors;
