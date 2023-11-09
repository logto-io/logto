import password_rejected from './password-rejected.js';

const error = {
  general_required: `{{types, list(type: disjunction;)}} es requerido`,
  general_invalid: `El/La {{types, list(type: disjunction;)}} no es válido`,
  username_required: 'Se requiere un nombre de usuario',
  password_required: 'Se requiere una contraseña',
  username_exists: 'El nombre de usuario ya existe',
  username_should_not_start_with_number: 'El nombre de usuario no debe comenzar con un número',
  username_invalid_charset:
    'El nombre de usuario solo debe contener letras, números o guiones bajos.',
  invalid_email: 'El correo electrónico no es válido',
  invalid_phone: 'El número de teléfono no es válido',
  passwords_do_not_match: 'Las contraseñas no coinciden. Por favor intente de nuevo',
  invalid_passcode: 'El código de verificación no es válido',
  invalid_connector_auth: 'La autorización no es válida',
  invalid_connector_request: 'Los datos del conector no son válidos',
  unknown: 'Error desconocido. Por favor intente de nuevo más tarde.',
  invalid_session: 'No se encontró la sesión. Por favor regrese e inicie sesión nuevamente.',
  timeout: 'Tiempo de espera de solicitud agotado. Por favor intente de nuevo más tarde.',
  password_rejected,
  sso_not_enabled:
    'El inicio de sesión único no está habilitado para esta cuenta de correo electrónico.',
};

export default Object.freeze(error);
