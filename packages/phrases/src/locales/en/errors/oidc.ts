const oidc = {
  aborted: 'The end-user aborted interaction.',
  invalid_scope: 'Invalid scope: {{error_description}}.',
  invalid_token: 'Invalid token provided.',
  invalid_client_metadata: 'Invalid client metadata provided.',
  insufficient_scope: 'Token missing scope `{{scope}}`.',
  invalid_request: 'Request is invalid.',
  invalid_grant: 'Grant request is invalid.',
  invalid_issuer: 'Invalid issuer.',
  invalid_redirect_uri:
    "`redirect_uri` did not match any of the client's registered `redirect_uris`.",
  access_denied: 'Access denied.',
  invalid_target: 'Invalid resource indicator.',
  unsupported_grant_type: 'Unsupported `grant_type` requested.',
  unsupported_response_mode: 'Unsupported `response_mode` requested.',
  unsupported_response_type: 'Unsupported `response_type` requested.',
  /** @deprecated Use {@link oidc.server_error} or {@link oidc.provider_error_fallback} instead. */
  provider_error: 'OIDC Internal Error: {{message}}.',
  server_error: 'An unknown OIDC error occurred. Please try again later.',
  provider_error_fallback: 'An OIDC error occurred: {{code}}.',
  key_required: 'At least one key is required.',
  key_not_found: 'Key with ID {{id}} is not found.',
  invalid_session_payload: 'Invalid session payload.',
  session_not_found: 'Session not found.',
  invalid_session_account_id: 'Session accountId mismatch.',
};

export default Object.freeze(oidc);
