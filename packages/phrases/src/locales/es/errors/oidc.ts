const oidc = {
  aborted: 'El usuario final abortó la interacción.',
  /** UNTRANSLATED */
  invalid_scope: 'Invalid scope: {{error_description}}.',
  invalid_token: 'Se proporcionó un token no válido.',
  invalid_client_metadata: 'Se proporcionaron metadatos de cliente no válidos.',
  /** UNTRANSLATED */
  insufficient_scope: 'Token missing scope `{{scope}}`.',
  invalid_request: 'La solicitud no es válida.',
  invalid_grant: 'La solicitud de concesión es incorrecta.',
  invalid_redirect_uri:
    'La `redirect_uri` no coincide con ninguna de las `redirect_uris` registradas del cliente.',
  access_denied: 'Acceso denegado.',
  invalid_target: 'Indicador de recurso no válido.',
  unsupported_grant_type: 'Tipo de concesión no admitido solicitado.',
  unsupported_response_mode: 'Modo de respuesta no compatible solicitado.',
  unsupported_response_type: 'Tipo de respuesta no admitido solicitado.',
  provider_error: 'Error interno de OIDC: {{message}}.',
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
