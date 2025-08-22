const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    'URL de contenido vacío de "Términos de uso". Por favor, agregue la URL de contenido si "Términos de uso" está habilitado.',
  empty_social_connectors:
    'Conectores sociales vacíos. Por favor, agregue conectores sociales habilitados cuando se habilita el método de inicio de sesión social.',
  enabled_connector_not_found: 'No se encontró el conector {{type}} habilitado.',
  not_one_and_only_one_primary_sign_in_method:
    'Debe haber un único método de inicio de sesión primario. Por favor revise su entrada.',
  username_requires_password:
    'Debe habilitar la configuración de contraseña para el identificador de registro de nombre de usuario.',
  passwordless_requires_verify:
    'Debe habilitar la verificación para el identificador de registro de correo electrónico/número de teléfono.',
  miss_sign_up_identifier_in_sign_in:
    'Los métodos de inicio de sesión deben contener el identificador de registro.',
  password_sign_in_must_be_enabled:
    'La firma de contraseña debe estar habilitada cuando se requiere una contraseña en el registro.',
  code_sign_in_must_be_enabled:
    'La firma de código de verificación debe estar habilitada cuando no se requiere contraseña en el registro.',
  unsupported_default_language: 'Este lenguaje - {{language}} no es compatible en este momento.',
  at_least_one_authentication_factor: 'Debe seleccionar al menos un factor de autenticación.',
  backup_code_cannot_be_enabled_alone: 'El código de respaldo no se puede habilitar solo.',
  duplicated_mfa_factors: 'Factores MFA duplicados.',
  email_verification_code_cannot_be_used_for_mfa:
    'El código de verificación de correo electrónico no se puede usar para MFA cuando la verificación de correo electrónico está habilitada para el inicio de sesión.',
  phone_verification_code_cannot_be_used_for_mfa:
    'El código de verificación de SMS no se puede usar para MFA cuando la verificación de SMS está habilitada para el inicio de sesión.',
  email_verification_code_cannot_be_used_for_sign_in:
    'El código de verificación de correo electrónico no se puede usar para el inicio de sesión cuando está habilitado para MFA.',
  phone_verification_code_cannot_be_used_for_sign_in:
    'El código de verificación de SMS no se puede usar para el inicio de sesión cuando está habilitado para MFA.',
  duplicated_sign_up_identifiers: 'Identificadores de registro duplicados detectados.',
  missing_sign_up_identifiers: 'El identificador de registro principal no puede estar vacío.',
  invalid_custom_email_blocklist_format:
    'Elementos no válidos de la lista de bloqueo de correos electrónicos personalizados: {{items, list(type:conjunction)}}. Cada elemento debe ser una dirección de correo electrónico o dominio de correo electrónico válido, por ejemplo, foo@ejemplo.com o @ejemplo.com.',
  forgot_password_method_requires_connector:
    'El método de recuperación de contraseña requiere que se configure un conector {{method}} correspondiente.',
};

export default Object.freeze(sign_in_experiences);
