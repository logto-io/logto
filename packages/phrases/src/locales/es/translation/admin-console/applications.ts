const applications = {
  page_title: 'Aplicaciones',
  title: 'Aplicaciones',
  subtitle:
    'Configura la autenticación de Logto para tu aplicación nativa, de página única, de máquina a máquina o tradicional',
  subtitle_with_app_type: 'Configura la autenticación de Logto para tu aplicación {{name}}',
  create: 'Crear aplicación',
  create_third_party: 'Crear aplicación de terceros',
  create_thrid_party_modal_title: 'Crear una app de terceros ({{type}})',
  application_name: 'Nombre de la aplicación',
  application_name_placeholder: 'Mi App',
  application_description: 'Descripción de la aplicación',
  application_description_placeholder: 'Introduce la descripción de tu aplicación',
  select_application_type: 'Seleccionar un tipo de aplicación',
  no_application_type_selected: 'Aún no has seleccionado ningún tipo de aplicación',
  application_created: '¡La aplicación se ha creado correctamente.',
  tab: {
    my_applications: 'Mis aplicaciones',
    third_party_applications: 'Aplicaciones de terceros',
  },
  app_id: 'ID de la aplicación',
  type: {
    native: {
      title: 'App nativa',
      subtitle: 'Una aplicación que se ejecuta en un entorno nativo',
      description: 'Por ejemplo, una app de iOS, una app de Android',
    },
    spa: {
      title: 'App de página única',
      subtitle:
        'Una aplicación que se ejecuta en un navegador web y actualiza dinámicamente los datos en su lugar',
      description: 'Por ejemplo, una app de React DOM, una app de Vue',
    },
    traditional: {
      title: 'Web tradicional',
      subtitle: 'Una aplicación que renderiza y actualiza páginas solo por el servidor web',
      description: 'Por ejemplo, Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Máquina a máquina',
      subtitle: 'Una aplicación (generalmente un servicio) que habla directamente con recursos',
      description: 'Por ejemplo, servicio backend',
    },
    protected: {
      title: 'App protegida',
      subtitle: 'Una aplicación protegida por Logto',
      description: 'N/A',
    },
    saml: {
      title: 'Aplicación SAML',
      subtitle: 'Una aplicación que se utiliza como conector de IdP de SAML',
      description: 'Por ejemplo, SAML',
    },
    third_party: {
      title: 'App de terceros',
      subtitle: 'Una aplicación que se utiliza como conector de proveedor de identidad de terceros',
      description: 'Ej.: OIDC, SAML',
    },
  },
  placeholder_title: 'Selecciona un tipo de aplicación para continuar',
  placeholder_description:
    'Logto utiliza una entidad de aplicación para OIDC para ayudar con tareas como la identificación de tus aplicaciones, la gestión de inicio de sesión y la creación de registros de auditoría.',
  third_party_application_placeholder_description:
    'Usa Logto como un Proveedor de Identidad para proporcionar autorización OAuth a servicios de terceros. \n Incluye una pantalla de consentimiento de usuario preconstruida para el acceso a recursos. <a>Más información</a>',
  guide: {
    third_party: {
      title: 'Integrar una aplicación de terceros',
      description:
        'Usa Logto como tu Proveedor de Identidad para proporcionar autorización OAuth a servicios de terceros. Incluye una pantalla de consentimiento de usuario preconstruida para un acceso seguro a los recursos. <a>Más información</a>',
    },
  },
};

export default Object.freeze(applications);
