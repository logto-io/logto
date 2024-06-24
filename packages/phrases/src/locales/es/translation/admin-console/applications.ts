const applications = {
  page_title: 'Aplicaciones',
  title: 'Aplicaciones',
  subtitle:
    'Configura la autenticación de Logto para tu aplicación nativa, de página única, de máquina a máquina o tradicional',
  subtitle_with_app_type: 'Configura la autenticación de Logto para tu aplicación {{name}}',
  create: 'Crear aplicación',
  create_subtitle_third_party:
    'Utiliza Logto como proveedor de identidad (IdP) para integrarte fácilmente con aplicaciones de terceros',
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
    third_party: {
      title: 'App de terceros',
      subtitle: 'Una aplicación que se utiliza como conector de proveedor de identidad de terceros',
      description: 'Ej.: OIDC, SAML',
    },
  },
  placeholder_title: 'Selecciona un tipo de aplicación para continuar',
  placeholder_description:
    'Logto utiliza una entidad de aplicación para OIDC para ayudar con tareas como la identificación de tus aplicaciones, la gestión de inicio de sesión y la creación de registros de auditoría.',
};

export default Object.freeze(applications);
