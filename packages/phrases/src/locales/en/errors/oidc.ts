const oidc = {
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
};

export default oidc;
