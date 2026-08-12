const applications = {
  page_title: 'Aplicaciones',
  title: 'Aplicaciones',
  subtitle:
    'Configura la autenticación de Logto para tu aplicación nativa, de página única, de máquina a máquina o tradicional',
  subtitle_with_app_type: 'Configura la autenticación de Logto para tu aplicación {{name}}',
  create_device_flow_description:
    'Crea una aplicación nativa que utiliza la concesión de autorización de dispositivo OAuth 2.0 para dispositivos con entrada limitada o aplicaciones headless.',
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
      description: 'Por ejemplo, una app de iOS, una app de Android, app de escritorio, TVs, CLI',
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
  authorization_flow: {
    title: 'Flujo de autorización',
    tooltip:
      'Seleccione el flujo de autorización para su aplicación. Una vez configurado, no se puede cambiar.',
    authorization_code: {
      title: 'Authorization code',
      description:
        'El tipo de autorización predeterminado y más común. Los usuarios son redirigidos a una página de inicio de sesión para autorizar el acceso directamente.',
    },
    device_flow: {
      title: 'Device flow',
      description:
        'Para dispositivos con entrada limitada o aplicaciones sin interfaz (p. ej., televisores, CLI). Los usuarios completan el inicio de sesión en un dispositivo separado ingresando un código de dispositivo o escaneando un código QR.',
    },
  },
  placeholder_title: 'Selecciona un tipo de aplicación para continuar',
  placeholder_description:
    'Logto utiliza una entidad de aplicación para OIDC para ayudar con tareas como la identificación de tus aplicaciones, la gestión de inicio de sesión y la creación de registros de auditoría.',
  third_party_application_placeholder_description:
    'Usa Logto como un Proveedor de Identidad para proporcionar autorización OAuth a servicios de terceros. \n Incluye una pantalla de consentimiento de usuario preconstruida para el acceso a recursos. <a>Más información</a>',
  dynamic_app: {
    title: 'Aplicación dinámica',
    subtitle: 'CIMD',
    description:
      'La aplicación dinámica permite que los clientes OAuth se conecten sin registro previo.',
    settings_description:
      'La aplicación dinámica permite que los clientes OAuth se conecten sin registro previo. Utiliza la especificación OAuth Client ID Metadata Document (CIMD).',
    app_id_placeholder: 'Proporcionado dinámicamente por cada cliente',
    enable_confirm_modal: {
      title: '¿Habilitar el acceso dinámico de clientes?',
      content:
        'Cualquier cliente OAuth con una URL de ID de cliente HTTPS pública y válida puede iniciar la autorización para este inquilino sin registro previo. El acceso sigue limitado por tus permisos máximos y el consentimiento del usuario.',
    },
    enabled: 'Aplicación dinámica habilitada correctamente.',
    disable_confirm_modal: {
      title: '¿Deshabilitar la aplicación dinámica?',
      content:
        'Los clientes CIMD ya no podrán iniciar nuevas solicitudes de autorización. Las concesiones existentes se conservarán y los tokens de acceso emitidos pueden seguir siendo válidos hasta que caduquen.',
    },
    disabled: 'Aplicación dinámica deshabilitada con éxito.',
    permissions: {
      user_title: 'Usuario',
      user_description:
        'Selecciona los permisos solicitados por los clientes OAuth para acceder a datos específicos del usuario.',
      grant_user_level_permissions: 'Conceder permisos de usuario',
      organization_title: 'Organización',
      organization_description:
        'Selecciona los permisos solicitados por los clientes OAuth para acceder a datos específicos de la organización.',
      grant_organization_level_permissions: 'Conceder permisos de organización',
      permission_delete_confirm:
        'Esta acción eliminará el permiso de la aplicación dinámica, impidiendo que los clientes OAuth soliciten la autorización del usuario para él. ¿Estás seguro de que deseas continuar?',
    },
  },
  guide: {
    third_party: {
      title: 'Integrar una aplicación de terceros',
      description:
        'Usa Logto como tu Proveedor de Identidad para proporcionar autorización OAuth a servicios de terceros. Incluye una pantalla de consentimiento de usuario preconstruida para un acceso seguro a los recursos. <a>Más información</a>',
    },
  },
};

export default Object.freeze(applications);
