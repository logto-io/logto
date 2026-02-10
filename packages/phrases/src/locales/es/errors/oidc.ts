const oidc = {
  aborted: 'El usuario final abortó la interacción.',
  invalid_scope: 'Ámbito no válido: {{error_description}}.',
  invalid_token: 'Se proporcionó un token no válido.',
  invalid_client_metadata: 'Se proporcionaron metadatos de cliente no válidos.',
  insufficient_scope: 'Falta el ámbito del token `{{scope}}`.',
  invalid_request: 'La solicitud no es válida.',
  invalid_grant: 'La concesión no es válida.',
  invalid_issuer: 'Emisor no válido.',
  invalid_redirect_uri:
    'La `redirect_uri` no coincide con ninguna de las `redirect_uris` registradas del cliente.',
  access_denied: 'Acceso denegado.',
  invalid_target: 'Indicador de recurso no válido.',
  unsupported_grant_type: 'Se solicitó un tipo de concesión no admitido.',
  unsupported_response_mode: 'Se solicitó un modo de respuesta no compatible.',
  unsupported_response_type: 'Se solicitó un tipo de respuesta no admitido.',
  provider_error: 'Error interno de OIDC: {{message}}.',
  server_error: 'Ocurrió un error desconocido de OIDC. Por favor, inténtelo de nuevo más tarde.',
  provider_error_fallback: 'Ocurrió un error de OIDC: {{code}}.',
  key_required: 'Se requiere al menos una clave.',
  key_not_found: 'No se encuentra la clave con ID {{id}}.',
  /** UNTRANSLATED */
  invalid_session_payload: 'Invalid session payload.',
  /** UNTRANSLATED */
  session_not_found: 'Session not found.',
  /** UNTRANSLATED */
  invalid_session_account_id: 'Session accountId mismatch.',
};

export default Object.freeze(oidc);
