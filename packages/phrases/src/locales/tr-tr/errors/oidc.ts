const oidc = {
  aborted: 'Son kullanıcı etkileşimi iptal etti.',
  invalid_scope: 'Kapsam geçersiz: {{error_description}}.',
  invalid_token: 'Sağlanan belirteç geçersiz.',
  invalid_client_metadata: 'Sağlanan istemci meta verisi geçersiz.',
  insufficient_scope: "Token'ın `{{scope}}` kapsamı eksik.",
  invalid_request: 'Geçersiz istek.',
  invalid_grant: 'Geçersiz hibe.',
  invalid_issuer: 'Geçersiz issuer.',
  invalid_redirect_uri:
    "Sağlanan `redirect_uri`, istemcilerin kayıtlı `redirect_uris`'lerinden hiçbiriyle eşleşmiyor",
  access_denied: 'Erişim reddedildi.',
  invalid_target: 'Geçersiz hedef.',
  unsupported_grant_type: 'Desteklenmeyen `grant_type` isteği.',
  unsupported_response_mode: 'Desteklenmeyen `response_mode` isteği.',
  unsupported_response_type: 'Desteklenmeyen `response_type` isteği.',
  provider_error: 'Dahili OIDC Hatası: {{message}}.',
  server_error: 'Bilinmeyen bir OIDC hatası oluştu. Lütfen daha sonra tekrar deneyin.',
  provider_error_fallback: 'Bir OIDC hatası oluştu: {{code}}.',
  key_required: 'En az bir anahtar gereklidir.',
  key_not_found: "ID'si {{id}} olan anahtar bulunamadı.",
  /** UNTRANSLATED */
  invalid_session_payload: 'Invalid session payload.',
  /** UNTRANSLATED */
  session_not_found: 'Session not found.',
  /** UNTRANSLATED */
  invalid_session_account_id: 'Session accountId mismatch.',
};

export default Object.freeze(oidc);
