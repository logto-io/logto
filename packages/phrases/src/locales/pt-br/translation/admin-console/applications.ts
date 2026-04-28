const applications = {
  page_title: 'Aplicativos',
  title: 'Aplicativos',
  subtitle:
    'Configure um aplicativo móvel, de página única, máquina a máquina ou tradicional para usar o Logto para autenticação',
  subtitle_with_app_type: 'Configure a autenticação Logto para o seu aplicativo {{name}}',
  create_device_flow_description:
    'Crie um aplicativo nativo que usa a concessão de autorização de dispositivo OAuth 2.0 para dispositivos com entrada limitada ou aplicativos headless.',
  create: 'Criar aplicativo',
  create_third_party: 'Criar aplicativo de terceiros',
  create_thrid_party_modal_title: 'Criar um app de terceiros ({{type}})',
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
      description: 'Ex: aplicativo iOS, aplicativo Android, aplicativo desktop, TVs, CLI',
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
    saml: {
      title: 'Aplicativo SAML',
      subtitle: 'Um aplicativo usado como conector IdP SAML',
      description: 'Ex.: SAML',
    },
    third_party: {
      title: 'Aplicativo de Terceiros',
      subtitle: 'Um aplicativo usado como conector de IdP de terceiros',
      description: 'Ex.: OIDC, SAML',
    },
  },
  authorization_flow: {
    title: 'Fluxo de autorização',
    tooltip:
      'Selecione o fluxo de autorização para seu aplicativo. Uma vez definido, não poderá ser alterado.',
    authorization_code: {
      title: 'Authorization code',
      description:
        'O tipo de autorização padrão e mais comum. Os usuários são redirecionados para uma página de login para autorizar o acesso diretamente.',
    },
    device_flow: {
      title: 'Device flow',
      description:
        'Para dispositivos com entrada limitada ou aplicativos headless (ex.: TVs, CLI). Os usuários completam o login em um dispositivo separado inserindo um código de dispositivo ou escaneando um QR code.',
    },
  },
  placeholder_title: 'Selecione um tipo de aplicativo para continuar',
  placeholder_description:
    'O Logto usa uma entidade de aplicativo para OIDC para ajudar nas tarefas, como identificar seus aplicativos, gerenciar o login e criar logs de auditoria.',
  third_party_application_placeholder_description:
    'Use o Logto como um provedor de identidade para fornecer autorização OAuth a serviços de terceiros. \n Inclui uma tela de consentimento do usuário pré-construída para acesso a recursos. <a>Saiba mais</a>',
  guide: {
    third_party: {
      title: 'Integrar um aplicativo de terceiros',
      description:
        'Use o Logto como seu Provedor de Identidade para fornecer autorização OAuth a serviços de terceiros. Inclui uma tela de consentimento do usuário pré-construída para acesso seguro aos recursos. <a>Saiba mais</a>',
    },
  },
};

export default Object.freeze(applications);
