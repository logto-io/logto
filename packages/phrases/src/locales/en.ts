const translation = {
  sign_in: {
    action: 'Sign In',
    loading: 'Signing in...',
    error: 'Username or password is invalid.',
    username: 'Username',
    password: 'Password',
  },
  register: {
    create_account: 'Create an Account',
    action: 'Create',
    loading: 'Creating Account...',
    have_account: 'Already have an account?',
  },
};

const errors = {
  auth: {
    authorization_header_missing: 'Authorization header is missing.',
    authorization_token_type_not_supported: 'Authorization type is not supported.',
    unauthorized: 'Unauthorized. Please check credentils and its scope.',
    jwt_sub_missing: 'Missing `sub` in JWT.',
  },
  guard: {
    invalid_input: 'The request input is invalid.',
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
    username_exists: 'The username already exists.',
    email_exists: 'The email already exists.',
    invalid_email: 'Invalid email address.',
    invalid_phone: 'Invalid phone number.',
    email_not_exists: 'The email address has not been registered yet.',
    phone_not_exists: 'The phone number has not been registered yet.',
    identity_not_exists: 'The social account has not been registered yet.',
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
    insufficient_info: 'Insufficent sign-in info.',
  },
  connector: {
    not_found: 'Cannot find any available connector for type: {{type}}.',
    not_enabled: 'The connector is not enabled.',
    access_token_invalid: "Connector's access token is invalid.",
    oauth_code_invalid: 'Unable to get access token, please check authorization code.',
  },
  passcode: {
    phone_email_empty: 'Both phone and email are empty.',
    not_found: 'Passcode not found. Please send passcode first.',
    phone_mismatch: 'Phone mismatch. Please request a new passcode.',
    email_mismatch: 'Email mismatch. Please request a new passcode.',
    code_mismatch: 'Invalid passcode.',
    expired: 'Passcode has expired. Please request a new passcode.',
    exceed_max_try: 'Passcode verification limitaton exeeded. Please request a new passcode.',
  },
  swagger: {
    invalid_zod_type: 'Invalid Zod type, please check route guard config.',
  },
  entity: {
    create_failed: 'Failed to create {{name}}.',
    not_exists: 'The {{name}} does not exist.',
    not_exists_with_id: 'The {{name}} with ID `{{id}}` does not exist.',
    not_found: 'The resource does not exist',
  },
};

const en = Object.freeze({
  translation,
  errors,
});

export default en;
