const applications = {
  page_title: 'Aplicações',
  title: 'Aplicações',
  subtitle:
    'Configure um aplicativo móvel, de página única, machine to machine ou tradicional para usar o Logto para autenticação',
  create: 'Criar aplicação',
  application_name: 'Nome da aplicação',
  application_name_placeholder: 'Ex: Site Empresa',
  application_description: 'Descrição da aplicação',
  application_description_placeholder: 'Insira a descrição da sua aplicação',
  select_application_type: 'Selecione o tipo de aplicação',
  no_application_type_selected: 'Ainda não selecionou nenhum tipo de aplicação',
  application_created:
    'A aplicação {{name}} foi criada com sucesso.\nAgora termine as configurações do seu aplicativo.',
  app_id: 'ID da aplicação',
  type: {
    native: {
      title: 'Nativo',
      subtitle: 'Uma aplicação que é executada em um ambiente nativo',
      description: 'Ex., App iOS, App Android',
    },
    spa: {
      title: 'Página única (SPAs)',
      subtitle: 'Uma aplicação que é executada num navegador e atualiza dinamicamente os dados',
      description: 'Ex., App React, App VueJS',
    },
    traditional: {
      title: 'Web tradicional',
      subtitle: 'Uma aplicação que renderiza e atualiza páginas apenas pelo servidor web',
      description: 'Ex., Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle: 'Uma aplicação (normalmente um serviço) que se comunica diretamente com recursos',
      description: 'Ex., serviço back-end',
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
    get_sample_file: 'Obter amostra',
    title: 'A aplicação foi criada com sucesso',
    subtitle:
      'Agora siga as etapas abaixo para concluir as configurações da aplicação. Selecione o tipo de SDK para continuar.',
    description_by_sdk: 'Este guia de início rápido demonstra como integrar o Logto em {{sdk}}',
    do_not_need_tutorial:
      'If you don’t need a tutorial, you can continue without a framework guide', // UNTRANSLATED
    create_without_framework: 'Create app without framework', // UNTRANSLATED
    finish_and_done: 'Finalizar e concluir',
    cannot_find_guide: "Can't find your guide?", // UNTRANSLATED
    describe_guide_looking_for: 'Describe the guide you are looking for', // UNTRANSLATED
    describe_guide_looking_for_placeholder: 'E.g., I want to integrate Logto into my Angular app.', // UNTRANSLATED
    request_guide_successfully: 'Your request has been successfully submitted. Thank you!', // UNTRANSLATED
  },
  placeholder_title: 'Selecione um tipo de aplicação para continuar',
  placeholder_description:
    'O Logto usa uma entidade de aplicativo para OIDC para ajudar em tarefas como identificar seus aplicativos, gerenciar o registro e criar registros de auditoria.',
};

export default Object.freeze(applications);
