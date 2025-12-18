const description = {
  email: 'correo electrónico',
  phone_number: 'número de teléfono',
  username: 'nombre de usuario',
  reminder: 'Recordatorio',
  not_found: '404 No encontrado',
  agree_with_terms: 'He leído y acepto los ',
  agree_with_terms_modal: 'Para continuar, por favor acepte los <link></link>.',
  terms_of_use: 'Términos de uso',
  sign_in: 'Iniciar sesión',
  privacy_policy: 'Política de privacidad',
  create_account: 'Crear cuenta',
  switch_account: 'Cambiar cuenta',
  or: 'o',
  and: 'y',
  enter_passcode: 'El código de verificación ha sido enviado a su {{address}} {{target}}',
  passcode_sent: 'El código de verificación ha sido reenviado',
  resend_after_seconds:
    '¿No lo has recibido? Reenviar después de <span>{{seconds}}</span> segundos',
  resend_passcode: '¿No lo has recibido? <a>Reenviar código de verificación</a>',
  create_account_id_exists: 'Una cuenta con {{value}} ya existe. Continuar a iniciar sesión.',
  link_account_id_exists: 'La cuenta con {{type}} {{value}} ya existe. ¿Desea vincular?',
  sign_in_id_does_not_exist: 'No se encontró cuenta para {{value}}. ¿Crear una nueva?',
  sign_in_id_does_not_exist_alert: 'La cuenta con {{type}} {{value}} no existe.',
  create_account_id_exists_alert:
    'La cuenta con {{type}} {{value}} está vinculada a otra cuenta. Por favor intente con otra {{type}}.',
  social_identity_exist:
    'La {{type}} {{value}} está vinculada a otra cuenta. Por favor intente con otra {{type}}.',
  bind_account_title: 'Vincular o crear cuenta',
  social_create_account: 'Puede crear una nueva cuenta.',
  social_link_email: 'Puede vincular otro correo electrónico',
  social_link_phone: 'Puede vincular otro teléfono',
  social_link_email_or_phone: 'Puede vincular otro correo electrónico o teléfono',
  social_bind_with_existing:
    'Hemos encontrado una cuenta relacionada que ya ha sido registrada, y puede vincularla directamente.',
  skip_social_linking: '¿Omitir vinculación a la cuenta existente?',
  reset_password: 'Restablecer contraseña',
  reset_password_description:
    'Ingrese los {{types, lista(type: disyunción;)}} asociados a su cuenta, y le enviaremos el código de verificación para restablecer su contraseña.',
  new_password: 'Nueva contraseña',
  set_password: 'Establecer contraseña',
  password_changed: 'Contraseña cambiada',
  no_account: '¿No tiene una cuenta todavía? ',
  have_account: '¿Ya tiene una cuenta?',
  enter_password: 'Ingrese la contraseña',
  enter_password_for: 'Inicie sesión con la contraseña de {{method}} {{value}}',
  enter_username: 'Establecer nombre de usuario',
  enter_username_description:
    'El nombre de usuario es una alternativa para iniciar sesión. Debe contener solo letras, números y guiones bajos.',
  link_email: 'Vincular correo electrónico',
  link_phone: 'Vincular teléfono',
  link_email_or_phone: 'Vincular correo electrónico o teléfono',
  link_email_description:
    'Para mayor seguridad, por favor vincule su correo electrónico con la cuenta.',
  link_phone_description: 'Para mayor seguridad, por favor vincule su teléfono con la cuenta.',
  link_email_or_phone_description:
    'Para mayor seguridad, por favor vincule su correo electrónico o teléfono con la cuenta.',
  continue_with_more_information:
    'Para mayor seguridad, por favor complete los detalles de su cuenta a continuación.',
  create_your_account: 'Cree su cuenta',
  sign_in_to_your_account: 'Inicie sesión en su cuenta',
  no_region_code_found: 'No se encontró código de región',
  verify_email: 'Verificar su correo electrónico',
  verify_phone: 'Verificar su número de teléfono',
  password_requirements: 'Contraseña {{items, lista}}.',
  password_requirement: {
    length_one: 'requiere un mínimo de {{count}} carácter',
    length_two: 'requiere un mínimo de {{count}} caracteres',
    length_few: 'requiere un mínimo de {{count}} caracteres',
    length_many: 'requiere un mínimo de {{count}} caracteres',
    length_other: 'requiere un mínimo de {{count}} caracteres',
    character_types_one:
      'debe contener al menos {{count}} tipo de letras mayúsculas, letras minúsculas, dígitos y símbolos',
    character_types_two:
      'debe contener al menos {{count}} tipos de letras mayúsculas, letras minúsculas, dígitos y símbolos',
    character_types_few:
      'debe contener al menos {{count}} tipos de letras mayúsculas, letras minúsculas, dígitos y símbolos',
    character_types_many:
      'debe contener al menos {{count}} tipos de letras mayúsculas, letras minúsculas, dígitos y símbolos',
    character_types_other:
      'debe contener al menos {{count}} tipos de letras mayúsculas, letras minúsculas, dígitos y símbolos',
  },
  use: 'Usar',
  single_sign_on_email_form: 'Ingrese su dirección de correo electrónico corporativo',
  single_sign_on_connectors_list:
    'Su empresa ha habilitado el inicio de sesión único (Single Sign-On) para la cuenta de correo electrónico {{email}}. Puede continuar iniciando sesión con los siguientes proveedores de SSO.',
  single_sign_on_enabled:
    'El inicio de sesión único (Single Sign-On) está habilitado para esta cuenta',
  authorize_title: 'Autorizar {{name}}',
  request_permission: '{{name}} solicita acceso a:',
  grant_organization_access: 'Otorgar acceso a la organización:',
  authorize_personal_data_usage: 'Autorizar el uso de tus datos personales:',
  authorize_organization_access: 'Autorizar acceso a la organización específica:',
  user_scopes: 'Datos personales del usuario',
  organization_scopes: 'Acceso a la organización',
  authorize_agreement: `Al autorizar el acceso, aceptas los <link></link> de {{name}}.`,
  authorize_agreement_with_redirect: `Al autorizar el acceso, aceptas los <link></link> de {{name}}, y serás redirigido a {{uri}}.`,
  not_you: '¿No eres tú?',
  user_id: 'ID de usuario: {{id}}',
  redirect_to: 'Serás redirigido a {{name}}.',
  auto_agreement: 'Al continuar, acepta los <link></link>.',
  identifier_sign_in_description:
    'Ingrese su {{types, list(type: disjunction;)}} para iniciar sesión.',
  all_sign_in_options: 'Todas las opciones de inicio de sesión',
  identifier_register_description:
    'Ingrese su {{types, list(type: disjunction;)}} para crear una nueva cuenta.',
  all_account_creation_options: 'Todas las opciones de creación de cuenta',
  back_to_sign_in: 'Volver a iniciar sesión',
  support_email: 'Correo electrónico de soporte: <link></link>',
  support_website: 'Sitio web de soporte: <link></link>',
  switch_account_title: 'Actualmente has iniciado sesión como {{account}}',
  switch_account_description:
    'Para continuar, se cerrará la sesión de la cuenta actual, y se cambiará automáticamente a la nueva cuenta.',
  about_yourself: 'Cuéntanos sobre ti',
};

export default Object.freeze(description);
