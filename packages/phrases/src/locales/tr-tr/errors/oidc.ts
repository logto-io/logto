const oidc = {
  aborted: 'Son kullanıcı etkileşimi iptal etti.',
  invalid_scope: '{{scope}} kapsamı desteklenmiyor.',
  invalid_scope_plural: '{{scopes}} kapsamları desteklenmiyor.',
  invalid_token: 'Sağlanan token geçersiz.',
  invalid_client_metadata: 'Sağlanan müşteri metadatası geçersiz.',
  insufficient_scope: 'Erişim tokenı istenen {{scopes}} kapsamında eksik.',
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
};

export default oidc;
