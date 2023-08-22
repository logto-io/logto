const applications = {
  page_title: 'Aplicativos',
  title: 'Aplicativos',
  subtitle:
    'Configure um aplicativo móvel, single page, machine to machine ou tradicional para usar o Logto para autenticação',
  subtitle_with_app_type: 'Configure a autenticação Logto para o seu aplicativo {{name}}',
  create: 'Criar aplicativo',
  application_name: 'Nome do Aplicativo',
  application_name_placeholder: 'Meu aplicativo',
  application_description: 'Descrição do aplicativo',
  application_description_placeholder: 'Digite a descrição do seu aplicativo',
  select_application_type: 'Selecione um tipo de aplicativo',
  no_application_type_selected: 'Você ainda não selecionou nenhum tipo de aplicativo',
  application_created: 'O aplicativo foi criado com sucesso.',
  app_id: 'App ID',
  type: {
    native: {
      title: 'Aplicativo Nativo',
      subtitle: 'Um aplicativo executado em um ambiente nativo',
      description: 'Ex: aplicativo iOS, aplicativo Android',
    },
    spa: {
      title: 'Aplicativo de Página Única',
      subtitle:
        'Um aplicativo que é executado em um navegador da Web e atualiza dinamicamente os dados no local',
      description: 'Ex: aplicativo React DOM, aplicativo Vue',
    },
    traditional: {
      title: 'Web Tradicional',
      subtitle: 'Um aplicativo que renderiza e atualiza páginas apenas pelo servidor da web',
      description: 'Ex: aplicativo Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle: 'Um aplicativo (geralmente um serviço) que fala diretamente com os recursos',
      description: 'Ex: serviço de backend',
    },
  },
  guide: {
    header_title: 'Selecione um framework ou tutorial',
    modal_header_title: 'Comece com o SDK e guias',
    header_subtitle:
      'Inicie o processo de desenvolvimento do seu aplicativo com nosso SDK pré-construído e tutoriais.',
    start_building: 'Começar Construção',
    categories: {
      featured: 'Popular e para você',
      Traditional: 'Aplicação web tradicional',
      SPA: 'Aplicação de página única',
      Native: 'Nativo',
      MachineToMachine: 'Machine-to-machine',
    },
    filter: {
      title: 'Filtrar framework',
      placeholder: 'Pesquisar framework',
    },
    select_a_framework: 'Selecione um framework',
    checkout_tutorial: 'Visualizar tutorial de {{name}}',
    get_sample_file: 'Obter amostra',
    title: 'O aplicativo foi criado com sucesso',
    subtitle:
      'Agora siga as etapas abaixo para concluir as configurações do aplicativo. Selecione o tipo de SDK para continuar.',
    description_by_sdk:
      'Este guia de início rápido demonstra como integrar o Logto ao aplicativo {{sdk}}',
    do_not_need_tutorial:
      'Se você não precisa de um tutorial, você pode continuar sem um guia de framework',
    create_without_framework: 'Criar aplicativo sem framework',
    finish_and_done: 'Concluído',
    cannot_find_guide: 'Não consegue encontrar seu guia?',
    describe_guide_looking_for: 'Descreva o guia que você está procurando',
    describe_guide_looking_for_placeholder:
      'Ex.: Quero integrar o Logto no meu aplicativo Angular.',
    request_guide_successfully: 'Sua solicitação foi enviada com sucesso. Obrigado!',
  },
  placeholder_title: 'Selecione um tipo de aplicativo para continuar',
  placeholder_description:
    'O Logto usa uma entidade de aplicativo para OIDC para ajudar nas tarefas, como identificar seus aplicativos, gerenciar o login e criar logs de auditoria.',
};

export default Object.freeze(applications);
