const oidc = {
  aborted: 'O utilizador final abortou a interação.',
  invalid_scope: 'Scope {{scope}} não é suportado.',
  invalid_scope_plural: 'Scope {{scopes}} não são suportados.',
  invalid_token: 'O Token fornecido é inválido.',
  invalid_client_metadata: 'Metadados de cliente inválidos fornecidos.',
  insufficient_scope: 'Token de acesso sem scope solicitado {{scopes}}.',
  invalid_request: 'Pedido inválido.',
  invalid_grant: 'Pedido Grant inválido.',
  invalid_redirect_uri: '`redirect_uri` não correspondeu a nenhum dos `redirect_uris` registados.',
  access_denied: 'Acesso negado.',
  invalid_target: 'Indicador de recurso inválido.',
  unsupported_grant_type: '`grant_type` solicitado não é suportado.',
  unsupported_response_mode: '`response_mode` solicitado não é suportado.',
  unsupported_response_type: '`response_type` solicitado não é suportado.',
  provider_error: 'Erro interno OIDC: {{message}}.',
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
