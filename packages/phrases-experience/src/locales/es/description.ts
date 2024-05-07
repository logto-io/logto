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
  or: 'o',
  and: 'y',
  enter_passcode: 'El código de verificación ha sido enviado a su {{address}} {{target}}',
  passcode_sent: 'El código de verificación ha sido reenviado',
  resend_after_seconds: 'Reenviar después de <span>{{seconds}}</span> segundos',
  resend_passcode: 'Reenviar código de verificación',
  create_account_id_exists: 'La cuenta con {{type}} {{value}} ya existe, ¿desea iniciar sesión?',
  link_account_id_exists: 'La cuenta con {{type}} {{value}} ya existe. ¿Desea vincular?',
  sign_in_id_does_not_exist:
    'La cuenta con {{type}} {{value}} no existe, ¿desea crear una nueva cuenta?',
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
    'Hemos encontrado una cuenta relacionada, puede vincularla directamente.',
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
    length_other: 'requiere un mínimo de {{count}} caracteres',
    character_types_one:
      'debe contener al menos {{count}} tipo de letras mayúsculas, letras minúsculas, dígitos y símbolos',
    character_types_other:
      'debe contener al menos {{count}} tipos de letras mayúsculas, letras minúsculas, dígitos y símbolos',
  },
  use: 'Usar',
  single_sign_on_email_form: 'Ingrese su dirección de correo electrónico corporativo',
  single_sign_on_connectors_list:
    'Su empresa ha habilitado el inicio de sesión único (Single Sign-On) para la cuenta de correo electrónico {{email}}. Puede continuar iniciando sesión con los siguientes proveedores de SSO.',
  single_sign_on_enabled:
    'El inicio de sesión único (Single Sign-On) está habilitado para esta cuenta',
  /** UNTRANSLATED */
  authorize_title: 'Authorize {{name}}',
  /** UNTRANSLATED */
  request_permission: '{{name}} is requesting access to:',
  /** UNTRANSLATED */
  grant_organization_access: 'Grant the organization access:',
  /** UNTRANSLATED */
  authorize_personal_data_usage: 'Authorize the use of your personal data:',
  /** UNTRANSLATED */
  authorize_organization_access: 'Authorize access to the specific organization:',
  /** UNTRANSLATED */
  user_scopes: 'Personal user data',
  /** UNTRANSLATED */
  organization_scopes: 'Organization access',
  /** UNTRANSLATED */
  authorize_agreement: `By authorizing the access, you agree to the {{name}}'s <link></link>.`,
  /** UNTRANSLATED */
  authorize_agreement_with_redirect: `By authorizing the access, you agree to the {{name}}'s <link></link>, and will be redirected to {{uri}}.`,
  /** UNTRANSLATED */
  not_you: 'Not you?',
  /** UNTRANSLATED */
  user_id: 'User ID: {{id}}',
  /** UNTRANSLATED */
  redirect_to: 'You will be redirected to {{name}}.',
};

export default Object.freeze(description);
