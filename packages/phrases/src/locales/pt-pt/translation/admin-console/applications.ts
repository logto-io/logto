const applications = {
  page_title: 'Aplicações',
  title: 'Aplicações',
  subtitle:
    'Configure uma aplicação móvel, de página única, máquina a máquina ou tradicional para utilizar o Logto para autenticação',
  subtitle_with_app_type: 'Configurar autenticação Logto para a aplicação {{name}}',
  create: 'Criar aplicação',
  create_third_party: 'Criar aplicação de terceiros',
  create_thrid_party_modal_title: 'Criar uma app de terceiros ({{type}})',
  application_name: 'Nome da aplicação',
  application_name_placeholder: 'Ex: Site Empresa',
  application_description: 'Descrição da aplicação',
  application_description_placeholder: 'Insira a descrição da sua aplicação',
  select_application_type: 'Selecione o tipo de aplicação',
  no_application_type_selected: 'Ainda não selecionou nenhum tipo de aplicação',
  application_created: 'A aplicação foi criada com sucesso.',
  tab: {
    my_applications: 'As minhas apps',
    third_party_applications: 'Apps de terceiros',
  },
  app_id: 'ID da App',
  type: {
    native: {
      title: 'Nativo',
      subtitle: 'Uma aplicação que é executada num ambiente nativo',
      description: 'Ex.: App iOS, App Android',
    },
    spa: {
      title: 'Página única (SPAs)',
      subtitle: 'Uma aplicação que é executada num navegador e atualiza dinamicamente os dados',
      description: 'Ex.: App React, App VueJS',
    },
    traditional: {
      title: 'Web tradicional',
      subtitle: 'Uma aplicação que renderiza e atualiza páginas apenas pelo servidor web',
      description: 'Ex.: Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Máquina a Máquina',
      subtitle: 'Uma aplicação (normalmente um serviço) que comunica diretamente com recursos',
      description: 'Ex.: serviço back-end',
    },
    protected: {
      title: 'App Protegida',
      subtitle: 'Uma aplicação protegida pelo Logto',
      description: 'N/A',
    },
    saml: {
      title: 'App SAML',
      subtitle: 'Uma aplicação que é usada como um conector de IdP SAML',
      description: 'Ex.: SAML',
    },
    third_party: {
      title: 'App de Terceiros',
      subtitle: 'Uma aplicação utilizada como conetor de IdP de terceiros',
      description: 'E.g., OIDC, SAML',
    },
  },
  placeholder_title: 'Selecione um tipo de aplicação para continuar',
  placeholder_description:
    'O Logto usa uma entidade de aplicativo para OIDC para ajudar em tarefas como identificar seus aplicativos, gerenciar o registro e criar registros de auditoria.',
  third_party_application_placeholder_description:
    'Use o Logto como um Provedor de Identidade para fornecer autorização OAuth para serviços de terceiros. \n Inclui uma tela de consentimento do utilizador pré-construída para acesso a recursos. <a>Saiba mais</a>',
  guide: {
    third_party: {
      title: 'Integrar uma aplicação de terceiros',
      description:
        'Use o Logto como o seu Fornecedor de Identidade para fornecer autorização OAuth a serviços de terceiros. Inclui um ecrã de consentimento do utilizador pré-construído para acesso seguro aos recursos. <a>Saiba mais</a>',
    },
  },
};

export default Object.freeze(applications);
