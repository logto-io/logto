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
};

export default sign_in_experiences;
