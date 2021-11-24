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
  },
  oidc: {
    aborted: 'The end-user aborted interaction.',
    access_denied: 'The authorization server denied the request.',
    invalid_scope: 'Scope {{scopes}} is not supported.',
    invalid_scope_plural: 'Scope {{scopes}} are not supported.',
  },
  user: {
    not_exists: 'The user does not exist.',
    username_exists: 'The username already exists.',
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
  swagger: {
    invalid_zod_type: 'Invalid Zod type, please check route guard config.',
  },
  entity: {
    create_failed: 'Failed to create {{name}}.',
    not_exists: 'The {{name}} does not exist.',
    not_exists_with_id: 'The {{name}} with ID `{{id}}` does not exist.',
  },
};

const en = Object.freeze({
  translation,
  errors,
});

export default en;
