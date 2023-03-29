const oidc = {
  aborted: 'El usuario final abortó la interacción.',
  invalid_scope: 'El alcance {{scope}} no es compatible.',
  invalid_scope_plural: 'Los alcances {{scopes}} no son compatibles.',
  invalid_token: 'Se proporcionó un token no válido.',
  invalid_client_metadata: 'Se proporcionaron metadatos de cliente no válidos.',
  insufficient_scope: 'El token de acceso no tiene el alcance solicitado {{scopes}}.',
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
};

export default oidc;
