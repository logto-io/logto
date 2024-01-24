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
  tab: {
    /** UNTRANSLATED */
    my_applications: 'My apps',
    /** UNTRANSLATED */
    third_party_applications: 'Third-party apps',
  },
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
    protected: {
      /** UNTRANSLATED */
      title: 'Protected App',
      /** UNTRANSLATED */
      subtitle: 'An app that is protected by Logto',
      /** UNTRANSLATED */
      description: 'N/A',
    },
    third_party: {
      /** UNTRANSLATED */
      title: 'Third-party App',
      /** UNTRANSLATED */
      subtitle: 'An app that is used as a third-party IdP connector',
      /** UNTRANSLATED */
      description: 'E.g., OIDC, SAML',
    },
  },
  placeholder_title: 'Selecione um tipo de aplicativo para continuar',
  placeholder_description:
    'O Logto usa uma entidade de aplicativo para OIDC para ajudar nas tarefas, como identificar seus aplicativos, gerenciar o login e criar logs de auditoria.',
};

export default Object.freeze(applications);
