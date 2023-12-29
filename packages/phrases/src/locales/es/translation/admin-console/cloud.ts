const cloud = {
  general: {
    onboarding: 'Integración',
  },
  welcome: {
    page_title: 'Bienvenida',
    title: '¡Bienvenido a Logto Cloud! Nos encantaría saber un poco más sobre ti.',
    description:
      'Hagamos que su experiencia de Logto sea única para usted al conocerlo mejor. Su información está segura con nosotros.',
    project_field: 'Estoy usando Logto para:',
    project_options: {
      personal: 'Proyecto personal',
      company: 'Proyecto empresarial',
    },
    company_name_field: 'Nombre de la empresa',
    company_name_placeholder: 'Acme.co',
    /** UNTRANSLATED */
    stage_field: 'What stage is your product currently in?',
    stage_options: {
      /** UNTRANSLATED */
      new_product: 'Start a new project and looking for a quick, out-of-the-box solution',
      /** UNTRANSLATED */
      existing_product:
        'Migrate from current authentication (e.g., self-built, Auth0, Cognito, Microsoft)',
      /** UNTRANSLATED */
      target_enterprise_ready:
        'I just landed bigger clients and now make my product ready to sell to enterprises',
    },
    /** UNTRANSLATED */
    additional_features_field: 'Do you have anything else you want us to know?',
    additional_features_options: {
      /** UNTRANSLATED */
      customize_ui_and_flow:
        'Need the ability to bring my own UI, or customize my own flows via Logto API',
      /** UNTRANSLATED */
      compliance: 'SOC2 and GDPR are must-haves',
      /** UNTRANSLATED */
      export_user_data: 'Need the ability to export user data from Logto',
      /** UNTRANSLATED */
      budget_control: 'I have very tight budget control',
      /** UNTRANSLATED */
      bring_own_auth: 'Have my own auth services and just need some Logto features',
      /** UNTRANSLATED */
      others: 'None of these above',
    },
  },
  sie: {
    page_title: 'Personalización de la experiencia de inicio de sesión',
    title: 'Primero personalicemos su experiencia de inicio de sesión con facilidad',
    inspire: {
      title: 'Crear ejemplos convincentes',
      description:
        '¿Se siente inseguro acerca de la experiencia de inicio de sesión? ¡Simplemente haga clic en "Inspíreme" y deje que suceda la magia!',
      inspire_me: 'Inspírame',
    },
    logo_field: 'Logotipo de la aplicación',
    color_field: 'Color de marca',
    identifier_field: 'Identificador',
    identifier_options: {
      email: 'Correo electrónico',
      phone: 'Teléfono',
      user_name: 'Nombre de usuario',
    },
    authn_field: 'Autenticación',
    authn_options: {
      password: 'Contraseña',
      verification_code: 'Código de verificación',
    },
    social_field: 'Inicio de sesión social',
    finish_and_done: 'Terminar y listo',
    preview: {
      mobile_tab: 'Móvil',
      web_tab: 'Web',
    },
    connectors: {
      unlocked_later: 'Desbloqueado más adelante',
      unlocked_later_tip:
        'Una vez que haya completado el proceso de incorporación y haya ingresado al producto, tendrá acceso a una mayor cantidad de métodos de inicio de sesión social.',
      notice:
        'Evite utilizar el conector de demostración con fines de producción. Una vez que haya completado las pruebas, elimine amablemente el conector de demostración y configure su propio conector con sus credenciales.',
    },
  },
  socialCallback: {
    title: 'Ha iniciado sesión correctamente',
    description:
      'Ha iniciado sesión correctamente utilizando su cuenta social. Para garantizar una integración perfecta y el acceso a todas las funciones de Logto, recomendamos que proceda a configurar su propio conector social.',
  },
  tenant: {
    create_tenant: 'Crear inquilino',
  },
};

export default Object.freeze(cloud);
