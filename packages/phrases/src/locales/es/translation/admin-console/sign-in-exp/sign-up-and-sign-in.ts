const sign_up_and_sign_in = {
  identifiers_email: 'Dirección de correo electrónico',
  identifiers_phone: 'Número de teléfono',
  identifiers_username: 'Nombre de usuario',
  identifiers_email_or_sms: 'Dirección de correo electrónico o número de teléfono',
  identifiers_none: 'No aplicable',
  and: 'y',
  or: 'o',
  sign_up: {
    title: 'REGISTRARSE',
    sign_up_identifier: 'Identificador de registro',
    identifier_description:
      'Se requieren todos los identificadores de registro seleccionados al crear una nueva cuenta.',
    sign_up_authentication: 'Configuración de autenticación para el registro',
    verification_tip:
      'Los usuarios deben verificar el correo electrónico o el número de teléfono que hayas configurado ingresando un código de verificación durante el registro.',
    authentication_description:
      'Todas las acciones seleccionadas serán obligatorias para que los usuarios completen el proceso.',
    set_a_password_option: 'Crear una contraseña',
    verify_at_sign_up_option: 'Verificar al registrarse',
    social_only_creation_description:
      '(Esto se aplica solo a la creación de cuentas mediante redes sociales)',
  },
  sign_in: {
    title: 'INICIAR SESIÓN',
    sign_in_identifier_and_auth:
      'Identificador y configuración de autenticación para iniciar sesión',
    description:
      'Los usuarios pueden iniciar sesión usando cualquiera de las opciones disponibles.',
    add_sign_in_method: 'Agregar método de inicio de sesión',
    add_sign_up_method: 'Agregar método de registro',
    password_auth: 'Contraseña',
    verification_code_auth: 'Código de verificación',
    auth_swap_tip:
      'Intercambia las opciones a continuación para determinar cuál aparece primero en el proceso.',
    require_auth_factor: 'Debes seleccionar al menos un factor de autenticación.',
    forgot_password_verification_method: 'Método de verificación de contraseña olvidada',
    forgot_password_description:
      'Los usuarios pueden restablecer su contraseña utilizando cualquier método de verificación disponible.',
    add_verification_method: 'Agregar método de verificación',
    email_verification_code: 'Código de verificación de correo electrónico',
    phone_verification_code: 'Código de verificación de teléfono',
  },
  social_sign_in: {
    title: 'INICIO DE SESIÓN SOCIAL',
    social_sign_in: 'Inicio de sesión social',
    description:
      'Dependiendo del identificador obligatorio que hayas establecido, se puede solicitar al usuario que proporcione un identificador al registrarse mediante un conector social.',
    add_social_connector: 'Agregar conector social',
    set_up_hint: {
      not_in_list: '¿No está en la lista?',
      set_up_more: 'Configura',
      go_to: 'otros conectores sociales ahora.',
    },
    automatic_account_linking: 'Vinculación automática de cuenta',
    automatic_account_linking_label:
      'Cuando está activada, si un usuario inicia sesión con una identidad social que es nueva para el sistema y hay exactamente una cuenta existente con el mismo identificador (por ejemplo, correo electrónico), Logto vinculará automáticamente la cuenta con la identidad social en lugar de solicitar al usuario la vinculación de la cuenta.',
  },
  tip: {
    set_a_password:
      'Es esencial que se establezca una contraseña única para que coincida con tu nombre de usuario.',
    verify_at_sign_up:
      'Actualmente solo admitimos correo electrónico verificado. Tu base de usuarios puede contener un gran número de direcciones de correo electrónico de baja calidad si no se valida.',
    password_auth:
      'Es esencial ya que has habilitado la opción de establecer una contraseña durante el proceso de registro.',
    verification_code_auth:
      'Es esencial ya que solo has habilitado la opción de proporcionar un código de verificación al registrarse. Se puede desactivar la opción si se permite la configuración de contraseña durante el proceso de registro.',
    email_mfa_enabled:
      'El código de verificación de correo electrónico ya está habilitado para MFA, por lo que no se puede reutilizar como el método de inicio de sesión principal por razones de seguridad.',
    phone_mfa_enabled:
      'El código de verificación de teléfono ya está habilitado para MFA, por lo que no se puede reutilizar como el método de inicio de sesión principal por razones de seguridad.',
    delete_sign_in_method:
      'Es esencial ya que has seleccionado {{identifier}} como identificador obligatorio.',
    password_disabled_notification:
      'La opción "Crear tu contraseña" está deshabilitada para el registro con nombre de usuario, lo que puede impedir que los usuarios inicien sesión. Confirma para proceder con el guardado.',
  },
  advanced_options: {
    title: 'OPCIONES AVANZADAS',
    enable_single_sign_on: 'Habilitar inicio de sesión único de empresa (SSO)',
    enable_single_sign_on_description:
      'Habilitar a los usuarios para iniciar sesión en la aplicación mediante el inicio de sesión único con sus identidades empresariales.',
    single_sign_on_hint: {
      prefix: 'Ir a ',
      link: '"Enterprise SSO"',
      suffix: 'sección para configurar más conectores empresariales.',
    },
    enable_user_registration: 'Habilitar registro de usuario',
    enable_user_registration_description:
      'Habilitar o deshabilitar el registro de usuarios. Una vez deshabilitado, los usuarios aún se pueden agregar en la consola de administración, pero los usuarios ya no pueden establecer cuentas a través de la interfaz de inicio de sesión.',
    unknown_session_redirect_url: 'URL de redirección de sesión desconocida',
    unknown_session_redirect_url_tip:
      'A veces, Logto puede no reconocer la sesión de un usuario en la página de inicio de sesión, como cuando una sesión expira o el usuario marca como favorito o comparte el enlace de inicio de sesión. Por defecto, aparece un error 404 de “sesión desconocida”. Para mejorar la experiencia del usuario, establece una URL de respaldo para redirigir a los usuarios de vuelta a tu aplicación y reiniciar la autenticación.',
  },
};

export default Object.freeze(sign_up_and_sign_in);
