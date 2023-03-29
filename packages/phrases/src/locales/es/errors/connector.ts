const connector = {
  general: 'Se produjo un error en el conector: {{errorDescription}}',
  not_found: 'No se puede encontrar ningún conector disponible para el tipo: {{type}}.',
  not_enabled: 'El conector no está habilitado.',
  invalid_metadata: 'Los metadatos del conector son inválidos.',
  invalid_config_guard: 'El guardia de configuración del conector es inválido.',
  unexpected_type: 'El tipo del conector es inesperado.',
  invalid_request_parameters: 'La solicitud contiene parámetros de entrada incorrectos.',
  insufficient_request_parameters: 'La solicitud puede faltar algunos parámetros de entrada.',
  invalid_config: 'La configuración del conector es inválida.',
  invalid_response: 'La respuesta del conector es inválida.',
  template_not_found:
    'No se puede encontrar la plantilla correcta en la configuración del conector.',
  not_implemented: '{{method}}: aún no se ha implementado.',
  social_invalid_access_token: 'El token de acceso del conector es inválido.',
  invalid_auth_code: 'El código de autenticación del conector es inválido.',
  social_invalid_id_token: 'El token de identificación del conector es inválido.',
  authorization_failed: 'El proceso de autorización del usuario no tuvo éxito.',
  social_auth_code_invalid:
    'No se puede obtener el token de acceso, por favor revise el código de autorización.',
  more_than_one_sms: 'El número de conectores de SMS es mayor que 1.',
  more_than_one_email: 'El número de conectores de correo electrónico es mayor que 1.',
  more_than_one_connector_factory:
    'Se encontraron múltiples fábricas de conectores (con ID {{connectorIds}}), puede desinstalar las innecesarias.',
  db_connector_type_mismatch: 'Hay un conector en la base de datos que no coincide con el tipo.',
  not_found_with_connector_id:
    'No se puede encontrar el conector con el ID estándar de conector proporcionado.',
  multiple_instances_not_supported:
    'No se pueden crear múltiples instancias con el conector estándar seleccionado.',
  invalid_type_for_syncing_profile:
    'Solo puede sincronizar el perfil de usuario con conectores sociales.',
  can_not_modify_target: "No se puede modificar el 'objetivo' del conector.",
  should_specify_target: "Debe especificar el 'objetivo'.",
  multiple_target_with_same_platform:
    'No puede tener múltiples conectores sociales que tengan el mismo objetivo y plataforma.',
  cannot_overwrite_metadata_for_non_standard_connector:
    "Los 'metadatos' de este conector no se pueden sobrescribir.",
};

export default connector;
