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
    'A aplicação {{name}} foi criada com sucesso! \nAgora termine as configurações do seu aplicativo.',
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
    get_sample_file: 'Obter amostra',
    header_description:
      'Siga um guia passo a passo para integrar a sua aplicação ou clique com o botão direito para obter nosso projeto de amostra',
    title: 'A aplicação foi criada com sucesso',
    subtitle:
      'Agora siga as etapas abaixo para concluir as configurações da aplicação. Selecione o tipo de SDK para continuar.',
    description_by_sdk: 'Este guia de início rápido demonstra como integrar o Logto em {{sdk}}',
  },
  placeholder_title: 'Selecione um tipo de aplicação para continuar', // TRANSLATED
  placeholder_description:
    'O Logto usa uma entidade de aplicativo para OIDC para ajudar em tarefas como identificar seus aplicativos, gerenciar o registro e criar registros de auditoria.', // TRANSLATED
};

export default applications;
