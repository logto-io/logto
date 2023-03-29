const errors = {
  something_went_wrong: '¡Oops! Algo salió mal.',
  page_not_found: 'Página no encontrada',
  unknown_server_error: 'Ocurrió un error desconocido en el servidor',
  empty: 'Sin datos',
  missing_total_number: 'No se puede encontrar Total-Number en los encabezados de respuesta',
  invalid_uri_format: 'Formato de URI no válido',
  invalid_origin_format: 'Formato de origen de URI no válido',
  invalid_json_format: 'Formato JSON no válido',
  invalid_error_message_format: 'El formato del mensaje de error es inválido.',
  required_field_missing: 'Por favor ingrese {{field}}',
  required_field_missing_plural: 'Tienes que ingresar al menos un {{field}}',
  more_details: 'Más detalles',
  username_pattern_error:
    'El nombre de usuario solo debe contener letras, números o guiones bajos y no debe comenzar con un número.',
  password_pattern_error:
    'La contraseña requiere un mínimo de {{min}} caracteres y contiene una combinación de letras, números y símbolos.',
  insecure_contexts: 'Los contextos inseguros (no HTTPS) no son compatibles.',
  unexpected_error: 'Ocurrió un error inesperado.',
  not_found: '404 no encontrado',
  create_internal_role_violation:
    'Estás creando un nuevo rol interno que está prohibido por Logto. Prueba con otro nombre que no comience con "#intern:".',
};

export default errors;
