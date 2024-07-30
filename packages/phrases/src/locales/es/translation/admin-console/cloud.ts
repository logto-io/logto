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
    stage_field: '¿En qué etapa se encuentra su producto actualmente?',
    stage_options: {
      new_product: 'Comenzar un nuevo proyecto y buscar una solución rápida y lista para usar',
      existing_product:
        'Migrar desde una autenticación actual (por ejemplo, creada por uno mismo, Auth0, Cognito, Microsoft)',
      target_enterprise_ready:
        'Acabo de obtener clientes más grandes y ahora debo hacer que mi producto esté listo para vender a empresas',
    },
    additional_features_field: '¿Hay algo más que desee que sepamos?',
    additional_features_options: {
      customize_ui_and_flow:
        'Construir y gestionar mi propia interfaz de usuario, no solo usar la solución preconstruida y personalizable de Logto',
      compliance: 'SOC2 y GDPR son imprescindibles',
      export_user_data: 'Necesito la capacidad de exportar datos de usuario de Logto',
      budget_control: 'Tengo un control presupuestario muy ajustado',
      bring_own_auth:
        'Tengo mis propios servicios de autenticación y solo necesito algunas características de Logto',
      others: 'Ninguna de las anteriores',
    },
  },
  create_tenant: {
    page_title: 'Crear inquilino',
    title: 'Crea tu primer inquilino',
    description:
      'Un inquilino es un entorno aislado donde puedes gestionar identidades de usuarios, aplicaciones y todos los demás recursos de Logto.',
    invite_collaborators: 'Invita a tus colaboradores por correo electrónico',
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
    color_field: 'Color de la marca',
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
        'Una vez que haya completado el proceso de incorporación y haya ingresado al producto, tendrá acceso a una mayor variedad de métodos de inicio de sesión social.',
      notice:
        'Evite usar el conector de demostración para fines de producción. Una vez completadas las pruebas, elimine amablemente el conector de demostración y configure su propio conector con sus credenciales.',
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
