import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Experiencia de inicio de sesión',
  page_title_with_account: 'Inicio de sesión y cuenta',
  title: 'Inicio de sesión y cuenta',
  description:
    'Personaliza los flujos de autenticación y la interfaz de usuario, y previsualiza la experiencia lista para usar en tiempo real.',
  tabs: {
    branding: 'Branding',
    sign_up_and_sign_in: 'Registro e inicio de sesión',
    collect_user_profile: 'Recopilar perfil de usuario',
    account_center: 'Centro de cuentas',
    content: 'Contenido',
    password_policy: 'Política de contraseña',
  },
  welcome: {
    title: 'Personalice la experiencia de inicio de sesión',
    description:
      'Comience rápidamente con su primera configuración de inicio de sesión. Esta guía lo guiará a través de todas las configuraciones necesarias.',
    get_started: 'Comenzar',
    apply_remind:
      'Tenga en cuenta que la experiencia de inicio de sesión se aplicará a todas las aplicaciones de esta cuenta.',
  },
  color: {
    title: 'COLOR',
    primary_color: 'Color de la marca',
    dark_primary_color: 'Color de la marca (oscuro)',
    dark_mode: 'Habilitar modo oscuro',
    dark_mode_description:
      'Su aplicación tendrá un tema de modo oscuro generado automáticamente en función del color de su marca y el algoritmo de Logto. Puede personalizarlo libremente.',
    dark_mode_reset_tip:
      'Vuelva a calcular el color del modo oscuro en función del color de la marca.',
    reset: 'Volver a calcular',
  },
  branding: {
    title: 'ÁREA DE BRANDING',
    ui_style: 'Estilo',
    with_light: '{{value}}',
    with_dark: '{{value}} (oscuro)',
    app_logo_and_favicon: 'Logotipo y favicon de la aplicación',
    company_logo_and_favicon: 'Logotipo y favicon de la empresa',
    organization_logo_and_favicon: 'Logotipo y favicon de la organización',
    hide_logto_branding: 'Ocultar la marca Logto',
    hide_logto_branding_description:
      'Elimina "Powered by Logto". Destaca tu marca en exclusiva con una experiencia de inicio de sesión limpia y profesional.',
  },
  branding_uploads: {
    app_logo: {
      title: 'Logotipo de la aplicación',
      url: 'URL del logotipo de la aplicación',
      url_placeholder: 'https://tu.cdn.dominio/logo.png',
      error: 'Logotipo de la aplicación: {{error}}',
    },
    company_logo: {
      title: 'Logotipo de la empresa',
      url: 'URL del logotipo de la empresa',
      url_placeholder: 'https://tu.cdn.dominio/logo.png',
      error: 'Logotipo de la empresa: {{error}}',
    },
    organization_logo: {
      title: 'Subir imagen',
      url: 'URL del logotipo de la organización',
      url_placeholder: 'https://tu.cdn.dominio/logo.png',
      error: 'Logotipo de la organización: {{error}}',
    },
    connector_logo: {
      title: 'Subir imagen',
      url: 'URL del logotipo del conector',
      url_placeholder: 'https://tu.cdn.dominio/logo.png',
      error: 'Logotipo del conector: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'URL del favicon',
      url_placeholder: 'https://tu.cdn.dominio/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: 'Interfaz personalizada',
    css_code_editor_title: 'CSS personalizado',
    css_code_editor_description1: 'Vea el ejemplo de CSS personalizado.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Aprende más',
    css_code_editor_content_placeholder:
      'Introduce tu CSS personalizado para adaptar los estilos de cualquier cosa a tus especificaciones exactas. Expresa tu creatividad y haz que tu interfaz de usuario destaque.',
    bring_your_ui_title: 'Trae tu interfaz de usuario',
    bring_your_ui_description:
      'Sube un paquete comprimido (.zip) para reemplazar la interfaz de usuario preconstruida de Logto con tu propio código. <a>Aprende más</a>',
    preview_with_bring_your_ui_description:
      'Tus activos de la interfaz de usuario personalizada se han subido con éxito y ahora se están sirviendo. En consecuencia, la ventana de vista previa incorporada se ha deshabilitado.\nPara probar tu interfaz de inicio de sesión personalizada, haz clic en el botón "Vista previa en vivo" para abrirla en una nueva pestaña del navegador.',
  },
  account_center: {
    title: 'CENTRO DE CUENTAS',
    description: 'Personaliza los flujos de tu centro de cuentas usando las API de Logto.',
    enable_account_api: 'Habilitar la Account API',
    enable_account_api_description:
      'Activa la Account API para crear un centro de cuentas personalizado y ofrecer a los usuarios finales acceso directo a la API sin utilizar la Logto Management API.',
    field_options: {
      off: 'Desactivado',
      edit: 'Editar',
      read_only: 'Solo lectura',
      enabled: 'Activado',
      disabled: 'Inhabilitado',
    },
    sections: {
      account_security: {
        title: 'SEGURIDAD DE LA CUENTA',
        description:
          'Administra el acceso a la Account API para que los usuarios, después de iniciar sesión en la aplicación, puedan ver o editar su información de identidad y los factores de autenticación. Antes de realizar estos cambios relacionados con la seguridad, los usuarios deben verificar su identidad y obtener un ID de registro de verificación válido durante 10 minutos.',
        groups: {
          identifiers: {
            title: 'Identificadores',
          },
          authentication_factors: {
            title: 'Factores de autenticación',
          },
        },
      },
      user_profile: {
        title: 'PERFIL DEL USUARIO',
        description:
          'Administra el acceso a la Account API para que los usuarios puedan ver o editar datos básicos o personalizados del perfil después de iniciar sesión en la aplicación.',
        groups: {
          profile_data: {
            title: 'Datos del perfil',
          },
        },
      },
      secret_vault: {
        title: 'BÓVEDA SECRETA',
        description:
          'Para conectores sociales y empresariales, almacena de forma segura los tokens de acceso de terceros para invocar sus API (por ejemplo, agregar eventos a Google Calendar).',
        third_party_token_storage: {
          title: 'Token de terceros',
          third_party_access_token_retrieval: 'Recuperación de token de acceso de terceros',
          third_party_token_tooltip:
            'Para almacenar tokens, puedes activar esta opción en la configuración del conector social o empresarial correspondiente.',
          third_party_token_description:
            'Una vez que se habilita la Account API, la recuperación de tokens de terceros se activa automáticamente.',
        },
      },
    },
    fields: {
      email: 'Dirección de correo electrónico',
      phone: 'Número de teléfono',
      social: 'Identidades sociales',
      password: 'Contraseña',
      mfa: 'Autenticación multifactor',
      mfa_description:
        'Permite que los usuarios gestionen sus métodos MFA desde el centro de cuentas.',
      username: 'Nombre de usuario',
      name: 'Nombre',
      avatar: 'Avatar',
      profile: 'Perfil',
      profile_description: 'Controla el acceso a los atributos estructurados del perfil.',
      custom_data: 'Datos personalizados',
      custom_data_description:
        'Controla el acceso a los datos JSON personalizados almacenados en el usuario.',
    },
    webauthn_related_origins: 'Orígenes relacionados con WebAuthn',
    webauthn_related_origins_description:
      'Añade los dominios de tus aplicaciones front-end que pueden registrar passkeys a través de la Account API.',
    webauthn_related_origins_error: 'El origen debe comenzar con https:// o http://',
    prebuilt_ui: {
      /** UNTRANSLATED */
      title: 'INTEGRATE PREBUILT UI',
      /** UNTRANSLATED */
      description:
        'Quickly integrate out-of-the-box verification and security setting flows with prebuilt UI.',
      /** UNTRANSLATED */
      flows_title: 'Integrate out-of-the-box security setting flows',
      /** UNTRANSLATED */
      flows_description:
        'Combine your domain with the route to form your account setting URL (e.g., https://auth.foo.com/account/email). Optionally add a `redirect=` URL parameter to return users to your app after successfully updating.',
      tooltips: {
        /** UNTRANSLATED */
        email: 'Update your primary email address',
        /** UNTRANSLATED */
        phone: 'Update your primary phone number',
        /** UNTRANSLATED */
        username: 'Update your username',
        /** UNTRANSLATED */
        password: 'Set a new password',
        /** UNTRANSLATED */
        authenticator_app: 'Set up a new authenticator app for multi-factor authentication',
        /** UNTRANSLATED */
        passkey_add: 'Register a new passkey',
        /** UNTRANSLATED */
        passkey_manage: 'Manage your existing passkeys or add new ones',
        /** UNTRANSLATED */
        backup_codes_generate: 'Generate a new set of 10 backup codes',
        /** UNTRANSLATED */
        backup_codes_manage: 'View your available backup codes or generate new ones',
      },
      /** UNTRANSLATED */
      customize_note: "Don't want the out-of-the-box experience? You can fully",
      /** UNTRANSLATED */
      customize_link: 'customize your flows with the Account API instead.',
    },
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'Aún no se ha configurado el conector SMS. Antes de completar la configuración, los usuarios no podrán iniciar sesión con este método. <a>{{link}}</a> en "Conectores"',
    no_connector_email:
      'Aún no se ha configurado el conector de correo electrónico. Antes de completar la configuración, los usuarios no podrán iniciar sesión con este método. <a>{{link}}</a> en "Conectores"',
    no_connector_social:
      'Todavía no ha configurado ningún conector social. Agregue conectores primero para aplicar métodos de inicio de sesión social. <a>{{link}}</a> en "Conectores".',
    no_connector_email_account_center:
      'Aún no se ha configurado el conector de correo electrónico. Configúrelo en <a>"Conectores de correo electrónico y SMS"</a>.',
    no_connector_sms_account_center:
      'Aún no se ha configurado el conector SMS. Configúrelo en <a>"Conectores de correo electrónico y SMS"</a>.',
    no_connector_social_account_center:
      'Aún no se ha configurado el conector social. Configúrelo en <a>"Conectores sociales"</a>.',
    no_mfa_factor: 'Aún no se ha configurado ningún factor de MFA. Configúrelo en <a>{{link}}</a>.',
    setup_link: 'Configuración',
  },
  save_alert: {
    description:
      'Está implementando nuevos procedimientos de inicio de sesión y registro. Todos sus usuarios pueden verse afectados por la nueva configuración. ¿Estás seguro de comprometerte con el cambio?',
    before: 'Antes',
    after: 'Después',
    sign_up: 'Registro',
    sign_in: 'Inicio de sesión',
    social: 'Social',
    forgot_password_migration_notice:
      'Hemos actualizado la verificación de contraseña olvidada para admitir métodos personalizados. Anteriormente, esto se determinaba automáticamente mediante sus conectores de correo electrónico y SMS. Haga clic en <strong>Confirmar</strong> para completar la actualización.',
  },
  preview: {
    title: 'Previsualización del inicio de sesión',
    live_preview: 'Vista previa en vivo',
    live_preview_tip: 'Guarde para previsualizar los cambios',
    native: 'Nativo',
    desktop_web: 'Web de escritorio',
    mobile_web: 'Web móvil',
    desktop: 'Escritorio',
    mobile: 'Móvil',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
