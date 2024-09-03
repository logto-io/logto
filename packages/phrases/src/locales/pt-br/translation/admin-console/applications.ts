const applications = {
  page_title: 'Aplicativos',
  title: 'Aplicativos',
  subtitle:
    'Configure um aplicativo móvel, de página única, máquina a máquina ou tradicional para usar o Logto para autenticação',
  subtitle_with_app_type: 'Configure a autenticação Logto para o seu aplicativo {{name}}',
  create: 'Criar aplicativo',
  create_subtitle_third_party:
    'Use o Logto como seu provedor de identidade (IdP) para integrar facilmente com aplicativos de terceiros',
  application_name: 'Nome do Aplicativo',
  application_name_placeholder: 'Meu aplicativo',
  application_description: 'Descrição do aplicativo',
  application_description_placeholder: 'Digite a descrição do seu aplicativo',
  select_application_type: 'Selecione um tipo de aplicativo',
  no_application_type_selected: 'Você ainda não selecionou nenhum tipo de aplicativo',
  application_created: 'O aplicativo foi criado com sucesso.',
  tab: {
    my_applications: 'Meus aplicativos',
    third_party_applications: 'Aplicativos de terceiros',
  },
  app_id: 'ID do App',
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
      title: 'Máquina a Máquina',
      subtitle: 'Um aplicativo (geralmente um serviço) que fala diretamente com os recursos',
      description: 'Ex: serviço de backend',
    },
    protected: {
      title: 'Aplicativo Protegido',
      subtitle: 'Um aplicativo protegido pelo Logto',
      description: 'N/A',
    },
    third_party: {
      title: 'Aplicativo de Terceiros',
      subtitle: 'Um aplicativo usado como conector de IdP de terceiros',
      description: 'Ex.: OIDC, SAML',
    },
  },
  placeholder_title: 'Selecione um tipo de aplicativo para continuar',
  placeholder_description:
    'O Logto usa uma entidade de aplicativo para OIDC para ajudar nas tarefas, como identificar seus aplicativos, gerenciar o login e criar logs de auditoria.',
};

export default Object.freeze(applications);
