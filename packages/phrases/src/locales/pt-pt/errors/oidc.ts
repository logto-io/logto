const oidc = {
  aborted: 'O utilizador final abortou a interação.',
  invalid_scope: 'Âmbito inválido: {{error_description}}.',
  invalid_token: 'O Token fornecido é inválido.',
  invalid_client_metadata: 'Metadados de cliente inválidos fornecidos.',
  insufficient_scope: 'Token em falta com âmbito `{{scope}}`.',
  invalid_request: 'Pedido inválido.',
  invalid_grant: 'Pedido Grant inválido.',
  invalid_issuer: 'Emissor inválido.',
  invalid_redirect_uri: '`redirect_uri` não correspondeu a nenhum dos `redirect_uris` registados.',
  access_denied: 'Acesso negado.',
  invalid_target: 'Indicador de recurso inválido.',
  unsupported_grant_type: '`grant_type` solicitado não é suportado.',
  unsupported_response_mode: '`response_mode` solicitado não é suportado.',
  unsupported_response_type: '`response_type` solicitado não é suportado.',
  provider_error: 'Erro interno OIDC: {{message}}.',
  server_error: 'Ocorreu um erro OIDC desconhecido. Por favor, tente novamente mais tarde.',
  provider_error_fallback: 'Ocorreu um erro OIDC: {{code}}.',
  key_required: 'Pelo menos uma chave é necessária.',
  key_not_found: 'A chave com ID {{id}} não foi encontrada.',
  /** UNTRANSLATED */
  invalid_session_payload: 'Invalid session payload.',
};

export default Object.freeze(oidc);
