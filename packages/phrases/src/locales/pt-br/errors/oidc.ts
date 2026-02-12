const oidc = {
  aborted: 'A interação foi abortada pelo usuário final',
  invalid_scope: 'Escopo inválido: {{error_description}}.',
  invalid_token: 'Token inválido.',
  invalid_client_metadata: 'Metadados do cliente inválidos.',
  insufficient_scope: 'Token sem escopo `{{scope}}`.',
  invalid_request: 'A solicitação é inválida.',
  invalid_grant: 'A concessão é inválida.',
  invalid_issuer: 'Emissor inválido.',
  invalid_redirect_uri:
    '`redirect_uri` não corresponde a nenhum `redirect_uris` registrado do cliente.',
  access_denied: 'Acesso negado.',
  invalid_target: 'Indicador de recurso inválido.',
  unsupported_grant_type: '`grant_type` não suportado.',
  unsupported_response_mode: '`response_mode` não suportado.',
  unsupported_response_type: '`response_type` não suportado.',
  provider_error: 'Erro interno OIDC: {{message}}.',
  server_error: 'Ocorreu um erro OIDC desconhecido. Por favor, tente novamente mais tarde.',
  provider_error_fallback: 'Ocorreu um erro OIDC: {{code}}.',
  key_required: 'Pelo menos uma chave é necessária.',
  key_not_found: 'Chave com ID {{id}} não encontrada.',
  /** UNTRANSLATED */
  invalid_session_payload: 'Invalid session payload.',
};

export default Object.freeze(oidc);
