const oidc = {
  aborted: 'Son kullanıcı etkileşimi iptal etti.',
  /** UNTRANSLATED */
  invalid_scope: 'Invalid scope: {{error_description}}.',
  invalid_token: 'Sağlanan token geçersiz.',
  invalid_client_metadata: 'Sağlanan müşteri metadatası geçersiz.',
  /** UNTRANSLATED */
  insufficient_scope: 'Token missing scope `{{scope}}`.',
  invalid_request: 'İstek geçersiz.',
  invalid_grant: 'Hibe talebi geçersiz.',
  invalid_redirect_uri:
    '`redirect_uri` müşterilerin kayıtlı `redirect_uris` Lerinin hiçbiri ile eşleşmedi',
  access_denied: 'Erişim engellendi.',
  invalid_target: 'Geçersiz kaynak göstergesi.',
  unsupported_grant_type: 'Desteklenmeyen `grant_type` istendi.',
  unsupported_response_mode: 'Desteklenmeye `response_mode` istendi.',
  unsupported_response_type: 'Desteklenmeyen `response_type` istendi.',
  provider_error: 'Dahili OIDC Hatası: {{message}}.',
  /** UNTRANSLATED */
  server_error: 'An unknown OIDC error occurred. Please try again later.',
  /** UNTRANSLATED */
  provider_error_fallback: 'An OIDC error occurred: {{code}}.',
  /** UNTRANSLATED */
  key_required: 'At least one key is required.',
  /** UNTRANSLATED */
  key_not_found: 'Key with ID {{id}} is not found.',
};

export default Object.freeze(oidc);
