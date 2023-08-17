const applications = {
  page_title: 'Aplicaciones',
  title: 'Aplicaciones',
  subtitle:
    'Configura la autenticación de Logto para tu aplicación nativa, de página única, de máquina a máquina o tradicional',
  subtitle_with_app_type: 'Set up Logto authentication for your {{name}} application', // UNTRANSLATED
  create: 'Crear aplicación',
  application_name: 'Nombre de la aplicación',
  application_name_placeholder: 'Mi App',
  application_description: 'Descripción de la aplicación',
  application_description_placeholder: 'Introduce la descripción de tu aplicación',
  select_application_type: 'Seleccionar un tipo de aplicación',
  no_application_type_selected: 'Aún no has seleccionado ningún tipo de aplicación',
  application_created:
    '¡La aplicación {{name}} se ha creado correctamente.\nAhora completa la configuración de tu aplicación.',
  app_id: 'ID de la App',
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
    header_title: 'Select a framework or tutorial', // UNTRANSLATED
    modal_header_title: 'Start with SDK and guides', // UNTRANSLATED
    header_subtitle: 'Jumpstart your app development process with our pre-built SDK and tutorials.', // UNTRANSLATED
    start_building: 'Start Building', // UNTRANSLATED
    categories: {
      featured: 'Popular and for you', // UNTRANSLATED
      Traditional: 'Traditional web app', // UNTRANSLATED
      SPA: 'Single page app', // UNTRANSLATED
      Native: 'Native', // UNTRANSLATED
      MachineToMachine: 'Machine-to-machine', // UNTRANSLATED
    },
    filter: {
      title: 'Filter framework', // UNTRANSLATED
      placeholder: 'Search for framework', // UNTRANSLATED
    },
    select_a_framework: 'Select a framework', // UNTRANSLATED
    checkout_tutorial: 'Checkout {{name}} tutorial', // UNTRANSLATED
    get_sample_file: 'Obtener muestra',
    title: 'La aplicación se ha creado correctamente',
    subtitle:
      'Sigue los pasos siguientes para completar la configuración de tu aplicación. Por favor, selecciona el tipo de SDK para continuar.',
    description_by_sdk:
      'Esta guía de inicio rápido muestra cómo integrar Logto en la aplicación {{sdk}}',
    do_not_need_tutorial:
      'If you don’t need a tutorial, you can continue without a framework guide', // UNTRANSLATED
    create_without_framework: 'Create app without framework', // UNTRANSLATED
    finish_and_done: 'Finalizar y hecho',
    cannot_find_guide: "Can't find your guide?", // UNTRANSLATED
    describe_guide_looking_for: 'Describe the guide you are looking for', // UNTRANSLATED
    describe_guide_looking_for_placeholder: 'E.g., I want to integrate Logto into my Angular app.', // UNTRANSLATED
    request_guide_successfully: 'Your request has been successfully submitted. Thank you!', // UNTRANSLATED
  },
  placeholder_title: 'Selecciona un tipo de aplicación para continuar',
  placeholder_description:
    'Logto utiliza una entidad de aplicación para OIDC para ayudar con tareas como la identificación de tus aplicaciones, la gestión de inicio de sesión y la creación de registros de auditoría.',
};

export default Object.freeze(applications);
