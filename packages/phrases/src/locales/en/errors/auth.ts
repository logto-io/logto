const auth = {
  authorization_header_missing: 'Authorization header is missing.',
  authorization_token_type_not_supported: 'Authorization type is not supported.',
  unauthorized: 'Unauthorized. Please check credentials and its scope.',
  forbidden: 'Forbidden. Please check your user roles and permissions.',
  expected_role_not_found: 'Expected role not found. Please check your user roles and permissions.',
  jwt_sub_missing: 'Missing `sub` in JWT.',
  require_re_authentication: 'Re-authentication is required to perform a protected action.',
};

export default auth;
