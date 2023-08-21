const applications = {
  page_title: 'Aplicaciones',
  title: 'Aplicaciones',
  subtitle:
    'Configura la autenticación de Logto para tu aplicación nativa, de página única, de máquina a máquina o tradicional',
  subtitle_with_app_type: 'Configura la autenticación de Logto para tu aplicación {{name}}',
  create: 'Crear aplicación',
  application_name: 'Nombre de la aplicación',
  application_name_placeholder: 'Mi App',
  application_description: 'Descripción de la aplicación',
  application_description_placeholder: 'Introduce la descripción de tu aplicación',
  select_application_type: 'Seleccionar un tipo de aplicación',
  no_application_type_selected: 'Aún no has seleccionado ningún tipo de aplicación',
  application_created: '¡La aplicación se ha creado correctamente.',
  app_id: 'App ID',
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
  },
  guide: {
    header_title: 'Selecciona un framework o tutorial',
    modal_header_title: 'Comienza con el SDK y las guías',
    header_subtitle:
      'Inicia tu proceso de desarrollo de aplicaciones con nuestro SDK pre-construido y tutoriales.',
    start_building: 'Comenzar a construir',
    categories: {
      featured: 'Popular y para ti',
      Traditional: 'Aplicación web tradicional',
      SPA: 'Aplicación de página única',
      Native: 'Nativa',
      MachineToMachine: 'Machine-to-machine',
    },
    filter: {
      title: 'Filtrar framework',
      placeholder: 'Buscar framework',
    },
    select_a_framework: 'Selecciona un framework',
    checkout_tutorial: 'Ver el tutorial de {{name}}',
    get_sample_file: 'Obtener archivo de ejemplo',
    title: 'La aplicación se ha creado correctamente',
    subtitle:
      'Sigue los siguientes pasos para completar la configuración de tu aplicación. Por favor, selecciona el tipo de SDK para continuar.',
    description_by_sdk:
      'Esta guía de inicio rápido muestra cómo integrar Logto en la aplicación {{sdk}}',
    do_not_need_tutorial: 'Si no necesitas un tutorial, puedes continuar sin una guía de framework',
    create_without_framework: 'Crear aplicación sin framework',
    finish_and_done: 'Terminar y listo',
    cannot_find_guide: '¿No puedes encontrar tu guía?',
    describe_guide_looking_for: 'Describe la guía que estás buscando',
    describe_guide_looking_for_placeholder:
      'Por ejemplo, quiero integrar Logto en mi aplicación Angular.',
    request_guide_successfully: 'Tu solicitud se ha enviado correctamente. ¡Gracias!',
  },
  placeholder_title: 'Selecciona un tipo de aplicación para continuar',
  placeholder_description:
    'Logto utiliza una entidad de aplicación para OIDC para ayudar con tareas como la identificación de tus aplicaciones, la gestión de inicio de sesión y la creación de registros de auditoría.',
};

export default Object.freeze(applications);
