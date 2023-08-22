const applications = {
  page_title: 'Aplicações',
  title: 'Aplicações',
  subtitle:
    'Configure um aplicativo móvel, de página única, machine to machine ou tradicional para usar o Logto para autenticação',
  subtitle_with_app_type: 'Configurar autenticação Logto para a aplicação {{name}}',
  create: 'Criar aplicação',
  application_name: 'Nome da aplicação',
  application_name_placeholder: 'Ex: Site Empresa',
  application_description: 'Descrição da aplicação',
  application_description_placeholder: 'Insira a descrição da sua aplicação',
  select_application_type: 'Selecione o tipo de aplicação',
  no_application_type_selected: 'Ainda não selecionou nenhum tipo de aplicação',
  application_created: 'A aplicação foi criada com sucesso.',
  app_id: 'App ID',
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
    header_title: 'Selecionar um framework ou tutorial',
    modal_header_title: 'Comece com SDK e guias',
    header_subtitle:
      'Agilize o processo de desenvolvimento do seu aplicativo com nosso SDK pré-criado e tutoriais.',
    start_building: 'Começar a construir',
    categories: {
      featured: 'Populares e para você',
      Traditional: 'Aplicativo web tradicional',
      SPA: 'Aplicativo de página única',
      Native: 'Nativo',
      MachineToMachine: 'Machine-to-machine',
    },
    filter: {
      title: 'Filtrar framework',
      placeholder: 'Pesquise por framework',
    },
    select_a_framework: 'Selecionar um framework',
    checkout_tutorial: 'Ver tutorial de {{name}}',
    get_sample_file: 'Obter amostra',
    title: 'A aplicação foi criada com sucesso',
    subtitle:
      'Agora siga as etapas abaixo para concluir as configurações da aplicação. Selecione o tipo de SDK para continuar.',
    description_by_sdk: 'Este guia de início rápido demonstra como integrar o Logto em {{sdk}}',
    do_not_need_tutorial:
      'Se você não precisa de um tutorial, pode continuar sem um guia de framework',
    create_without_framework: 'Criar aplicativo sem framework',
    finish_and_done: 'Finalizar e concluir',
    cannot_find_guide: 'Não consegue encontrar o seu guia?',
    describe_guide_looking_for: 'Descreva o guia que você está procurando',
    describe_guide_looking_for_placeholder: 'Ex: Quero integrar o Logto no meu aplicativo Angular.',
    request_guide_successfully: 'Seu pedido foi enviado com sucesso. Obrigado!',
  },
  placeholder_title: 'Selecione um tipo de aplicação para continuar',
  placeholder_description:
    'O Logto usa uma entidade de aplicativo para OIDC para ajudar em tarefas como identificar seus aplicativos, gerenciar o registro e criar registros de auditoria.',
};

export default Object.freeze(applications);
