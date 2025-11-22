import password_rejected from './password-rejected.js';

const error = {
  general_required: `{{types, list(type: disjunction;)}} es requerido`,
  general_invalid: `El/La {{types, list(type: disjunction;)}} no es válido`,
  invalid_min_max_input: 'El valor de entrada debe estar entre {{minValue}} y {{maxValue}}',
  invalid_min_max_length:
    'La longitud del valor de entrada debe estar entre {{minLength}} y {{maxLength}}',
  username_required: 'Se requiere un nombre de usuario',
  password_required: 'Se requiere una contraseña',
  username_exists: 'El nombre de usuario ya existe',
  username_should_not_start_with_number: 'El nombre de usuario no debe comenzar con un número',
  username_invalid_charset:
    'El nombre de usuario solo debe contener letras, números o guiones bajos.',
  invalid_email: 'El correo electrónico no es válido',
  invalid_phone: 'El número de teléfono no es válido',
  passwords_do_not_match: 'Las contraseñas no coinciden. Por favor intente de nuevo',
  invalid_passcode: 'El código de verificación no es válido.',
  invalid_connector_auth: 'La autorización no es válida',
  invalid_connector_request: 'Los datos del conector no son válidos',
  unknown: 'Error desconocido. Por favor intente de nuevo más tarde.',
  invalid_session: 'No se encontró la sesión. Por favor regrese e inicie sesión nuevamente.',
  timeout: 'Tiempo de espera de solicitud agotado. Por favor intente de nuevo más tarde.',
  password_rejected,
  sso_not_enabled:
    'El inicio de sesión único no está habilitado para esta cuenta de correo electrónico.',
  invalid_link: 'Enlace no válido',
  invalid_link_description: 'Tu token de un solo uso puede haber expirado o ya no ser válido.',
  captcha_verification_failed: 'Error al verificar el captcha.',
  terms_acceptance_required: 'Se requiere aceptar los términos',
  terms_acceptance_required_description:
    'Debes aceptar los términos para continuar. Por favor, inténtalo de nuevo.',
  something_went_wrong: 'Algo salió mal.',
  feature_not_enabled: 'Esta función no está habilitada.',
};

export default Object.freeze(error);
