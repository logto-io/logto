const errors = {
  request: {
    invalid_input: 'Input is invalid. {{details}}',
    general: 'Request error occurred.',
  },
  auth: {
    authorization_header_missing: 'Authorization header is missing.',
    authorization_token_type_not_supported: 'Authorization type is not supported.',
    unauthorized: 'Unauthorized. Please check credentials and its scope.',
    forbidden: 'Forbidden. Please check your user roles and permissions.',
    expected_role_not_found:
      'Expected role not found. Please check your user roles and permissions.',
    jwt_sub_missing: 'Missing `sub` in JWT.',
    require_re_authentication: 'Re-authentication is required to perform a protected action.',
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
    username_already_in_use: 'This username is already in use.',
    email_already_in_use: 'This email is associated with an existing account.',
    phone_already_in_use: 'This phone number is associated with an existing account.',
    invalid_email: 'Invalid email address.',
    invalid_phone: 'Invalid phone number.',
    email_not_exist: 'The email address has not been registered yet.',
    phone_not_exist: 'The phone number has not been registered yet.',
    identity_not_exist: 'The social account has not been registered yet.',
    identity_already_in_use: 'The social account has been associated with an existing account.',
    invalid_role_names: 'Role names ({{roleNames}}) are not valid.',
    cannot_delete_self: 'You cannot delete yourself.',
    sign_up_method_not_enabled: 'This sign-up method is not enabled.',
    sign_in_method_not_enabled: 'This sign-in method is not enabled.',
    same_password: 'New password cannot be the same as your old password.',
    password_required_in_profile: 'You need to set a password before signing-in.',
    new_password_required_in_profile: 'You need to set a new password.',
    password_exists_in_profile: 'Password already exists in your profile.',
    username_required_in_profile: 'You need to set a username before signing-in.',
    username_exists_in_profile: 'Username already exists in your profile.',
    email_required_in_profile: 'You need to add an email address before signing-in.',
    email_exists_in_profile: 'Your profile has already associated with an email address.',
    phone_required_in_profile: 'You need to add a phone number before signing-in.',
    phone_exists_in_profile: 'Your profile has already associated with a phone number.',
    email_or_phone_required_in_profile:
      'You need to add an email address or phone number before signing-in.',
    suspended: 'This account is suspended.',
    user_not_exist: 'User with {{ identity }} does not exist.',
    missing_profile: 'You need to provide additional info before signing-in.',
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
    verification_session_not_found:
      'The verification was not successful. Restart the verification flow and try again.',
    verification_expired:
      'The connection has timed out. Verify again to ensure your account safety.',
    unauthorized: 'Please sign in first.',
    unsupported_prompt_name: 'Unsupported prompt name.',
    forgot_password_not_enabled: 'Forgot password is not enabled.',
    verification_failed:
      'The verification was not successful. Restart the verification flow and try again.',
    connector_validation_session_not_found:
      'The connector session for token validation is not found.',
    identifier_not_found: 'User identifier not found. Please go back and sign in again.',
    interaction_not_found:
      'Interaction session not found. Please go back and start the session again.',
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
    not_found_with_connector_id: 'Can not find connector with given standard connector id.',
    multiple_instances_not_supported:
      'Can not create multiple instance with picked standard connector.',
    invalid_type_for_syncing_profile: 'You can only sync user profile with social connectors.',
    can_not_modify_target: "The connector 'target' can not be modified.",
    should_specify_target: "You should specify 'target'.",
    multiple_target_with_same_platform:
      'You can not have multiple social connectors that have same target and platform.',
    cannot_overwrite_metadata_for_non_standard_connector:
      "This connector's 'metadata' cannot be overwritten.",
  },
  verification_code: {
    phone_email_empty: 'Both phone and email are empty.',
    not_found: 'Verification code not found. Please send verification code first.',
    phone_mismatch: 'Phone mismatch. Please request a new verification code.',
    email_mismatch: 'Email mismatch. Please request a new verification code.',
    code_mismatch: 'Invalid verification code.',
    expired: 'Verification code has expired. Please request a new verification code.',
    exceed_max_try:
      'Verification code retries limitation exceeded. Please request a new verification code.',
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
    miss_sign_up_identifier_in_sign_in: 'Sign in methods must contain the sign up identifier.',
    password_sign_in_must_be_enabled:
      'Password sign in must be enabled when set a password is required in sign up.',
    code_sign_in_must_be_enabled:
      'Verification code sign in must be enabled when set a password is not required in sign up.',
    unsupported_default_language: 'This language - {{language}} is not supported at the moment.',
    at_least_one_authentication_factor: 'You have to select at least one authentication factor.',
  },
  localization: {
    cannot_delete_default_language:
      '{{languageTag}} is set as your default language and can’t be deleted.',
    invalid_translation_structure: 'Invalid data schemas. Please check your input and try again.',
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
  log: {
    invalid_type: 'The log type is invalid.',
  },
};

export default errors;
