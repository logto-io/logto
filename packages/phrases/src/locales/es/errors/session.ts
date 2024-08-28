const session = {
  not_found: 'Sesión no encontrada. Vuelva atrás e inicie sesión nuevamente.',
  invalid_credentials: 'Cuenta o contraseña incorrecta. Verifique su entrada.',
  invalid_sign_in_method: 'El método de inicio de sesión actual no está disponible.',
  invalid_connector_id: 'No se puede encontrar un conector disponible con el id {{connectorId}}.',
  insufficient_info: 'Información de inicio de sesión insuficiente.',
  connector_id_mismatch: 'El identificador del conector no coincide con el registro de la sesión.',
  connector_session_not_found:
    'No se encuentra la sesión del conector. Vuelva atrás e inicie sesión nuevamente.',
  verification_session_not_found:
    'La verificación no se completó correctamente. Reinicie el flujo de verificación e intente de nuevo.',
  verification_expired:
    'La conexión ha expirado. Verifique de nuevo para garantizar la seguridad de su cuenta.',
  verification_blocked_too_many_attempts:
    'Demasiados intentos en poco tiempo. Por favor, inténtelo de nuevo {{relativeTime}}.',
  unauthorized: 'Inicie sesión primero, por favor.',
  unsupported_prompt_name: 'Nombre de indicación no compatible.',
  forgot_password_not_enabled: 'Olvidé la contraseña no está habilitada.',
  verification_failed:
    'La verificación no se completó correctamente. Reinicie el flujo de verificación e intente de nuevo.',
  connector_validation_session_not_found:
    'No se encuentra la sesión del conector para la validación del token.',
  identifier_not_found:
    'Identificador de usuario no encontrado. Vuelva atrás e inicie sesión nuevamente.',
  interaction_not_found:
    'No se encuentra la sesión de interacción. Vuelva atrás y vuelva a iniciar la sesión.',
  not_supported_for_forgot_password:
    'Esta operación no es compatible para restablecer la contraseña.',
  mfa: {
    require_mfa_verification: 'Se requiere verificación de MFA para iniciar sesión.',
    mfa_sign_in_only: 'MFA solo está disponible para la interacción de inicio de sesión.',
    pending_info_not_found:
      'Información de MFA pendiente no encontrada, por favor inicie MFA primero.',
    invalid_totp_code: 'Código TOTP no válido.',
    webauthn_verification_failed: 'Fallo en la verificación de WebAuthn.',
    webauthn_verification_not_found: 'Verificación de WebAuthn no encontrada.',
    bind_mfa_existed: 'MFA ya existe.',
    backup_code_can_not_be_alone: 'El código de respaldo no puede ser el único MFA.',
    backup_code_required: 'Se requiere el código de respaldo.',
    invalid_backup_code: 'Código de respaldo no válido.',
    mfa_policy_not_user_controlled: 'La política de MFA no está controlada por el usuario.',
  },
  sso_enabled:
    'El inicio de sesión único está habilitado para este correo electrónico dado. Inicie sesión con SSO, por favor.',
};

export default Object.freeze(session);
