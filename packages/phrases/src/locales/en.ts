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
    authorization_type_not_supported: 'Authorization type is not supported.',
    unauthorized: 'Unauthorized. Please check credentils and its scope.',
    jwt_sub_missing: 'Missing `sub` in JWT.',
  },
  guard: {
    invalid_input: 'The request input is invalid.',
    invalid_pagination: 'The request pagination value is invalid.',
  },
  oidc: {
    aborted: 'The end-user aborted interaction.',
    invalid_scope: 'Scope {{scopes}} is not supported.',
    invalid_scope_plural: 'Scope {{scopes}} are not supported.',
  },
  user: {
    username_exists: 'The username already exists.',
    email_exists: 'The email already exists.',
    invalid_email: 'Invalid email address.',
    email_not_exists: 'The email address has not been registered yet.',
  },
  password: {
    unsupported_encryption_method: 'The encryption method {{name}} is not supported.',
    pepper_not_found: 'Password pepper not found. Please check your core envs.',
  },
  session: {
    not_found: 'Session not found. Please go back and sign in again.',
    invalid_credentials: 'Invalid credentials. Please check your input.',
    invalid_sign_in_method: 'Current sign-in method is not available.',
    insufficient_info: 'Insufficent sign-in info.',
  },
  connector: {
    not_found: 'Cannot find any available connector for type: {{type}}.',
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
