const oidc = {
  aborted: 'A interação abortada pelo end-user',
  invalid_scope: 'Escopo {{scope}} não é suportado.',
  invalid_scope_plural: 'Escopo {{scopes}} não são suportados.',
  invalid_token: 'Token inválido.',
  invalid_client_metadata: 'Metadados de cliente inválidos.',
  insufficient_scope: 'Escopo solicitado ausente {{scopes}} do token de acesso.',
  invalid_request: 'A solicitação é inválida.',
  invalid_grant: 'A solicitação de concessão é inválida.',
  invalid_redirect_uri:
    '`redirect_uri` não correspondeu a nenhum `redirect_uris` registrado do cliente.',
  access_denied: 'Acesso negado.',
  invalid_target: 'Indicador de recurso inválido.',
  unsupported_grant_type: '`grant_type` não suportado.',
  unsupported_response_mode: '`response_mode` não suportado.',
  unsupported_response_type: '`response_type` não suportado.',
  provider_error: 'Erro interno OIDC: {{message}}.',
  /** UNTRANSLATED */
  server_error: 'An unknown OIDC error occurred. Please try again later.',
  /** UNTRANSLATED */
  provider_error_fallback: 'An OIDC error occurred: {{code}}.',
};

export default Object.freeze(oidc);
