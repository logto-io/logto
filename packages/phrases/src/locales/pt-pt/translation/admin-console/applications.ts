const applications = {
  page_title: 'Aplicações',
  title: 'Aplicações',
  subtitle:
    'Configure uma aplicação móvel, de página única, máquina a máquina ou tradicional para utilizar o Logto para autenticação',
  subtitle_with_app_type: 'Configurar autenticação Logto para a aplicação {{name}}',
  create_device_flow_description:
    'Crie uma aplicação nativa que utiliza a concessão de autorização de dispositivo OAuth 2.0 para dispositivos com entrada limitada ou aplicações headless.',
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
      description: 'Ex.: App iOS, App Android, App desktop, TVs, CLI',
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
  authorization_flow: {
    title: 'Fluxo de autorização',
    tooltip:
      'Selecione o fluxo de autorização para a sua aplicação. Uma vez definido, não poderá ser alterado.',
    authorization_code: {
      title: 'Authorization code',
      description:
        'O tipo de autorização predefinido e mais comum. Os utilizadores são redirecionados para uma página de início de sessão para autorizar o acesso diretamente.',
    },
    device_flow: {
      title: 'Device flow',
      description:
        'Para dispositivos com entrada limitada ou aplicações headless (ex.: TVs, CLI). Os utilizadores completam o início de sessão num dispositivo separado, introduzindo um código de dispositivo ou digitalizando um código QR.',
    },
  },
  placeholder_title: 'Selecione um tipo de aplicação para continuar',
  placeholder_description:
    'O Logto usa uma entidade de aplicativo para OIDC para ajudar em tarefas como identificar seus aplicativos, gerenciar o registro e criar registros de auditoria.',
  third_party_application_placeholder_description:
    'Use o Logto como um Provedor de Identidade para fornecer autorização OAuth para serviços de terceiros. \n Inclui uma tela de consentimento do utilizador pré-construída para acesso a recursos. <a>Saiba mais</a>',
  dynamic_app: {
    title: 'Aplicação dinâmica',
    subtitle: 'CIMD',
    description: 'A aplicação dinâmica permite que clientes OAuth se liguem sem registo prévio.',
    settings_description:
      'A aplicação dinâmica permite que clientes OAuth se liguem sem registo prévio. Usa a especificação OAuth Client ID Metadata Document (CIMD).',
    beta_notice:
      'Aplicação dinâmica está atualmente em beta. Bem-vindo para explorar e <ContactLink>partilhar o seu feedback</ContactLink>.',
    app_id_placeholder: 'Fornecido dinamicamente por cada cliente',
    enable_confirm_modal: {
      title: 'Ativar o acesso dinâmico de clientes?',
      content:
        'Qualquer cliente OAuth com um URL de ID de cliente HTTPS público e válido pode iniciar a autorização para este inquilino sem registo prévio. O acesso permanece limitado pelas suas permissões máximas e pelo consentimento do utilizador.',
      beta_pricing_notice:
        'A aplicação dinâmica é gratuita durante a beta. Após a beta, pode haver cobrança como suplemento. Avisaremos com antecedência e pode desativá-la a qualquer momento.',
    },
    enabled: 'Aplicação dinâmica ativada com sucesso.',
    disable_confirm_modal: {
      title: 'Desativar a aplicação dinâmica?',
      content:
        'Os clientes CIMD deixarão de poder iniciar novos pedidos de autorização. As concessões existentes serão mantidas e os tokens de acesso emitidos podem permanecer válidos até expirarem.',
    },
    disabled: 'Aplicação dinâmica desativada com sucesso.',
    permissions: {
      user_title: 'Utilizador',
      user_description:
        'Selecione as permissões solicitadas pelos clientes OAuth para aceder a dados específicos do utilizador.',
      grant_user_level_permissions: 'Conceder permissões de utilizador',
      organization_title: 'Organização',
      organization_description:
        'Selecione as permissões solicitadas pelos clientes OAuth para aceder a dados específicos da organização.',
      grant_organization_level_permissions: 'Conceder permissões de organização',
      permission_delete_confirm:
        'Esta ação irá remover a permissão da aplicação dinâmica, impedindo os clientes OAuth de solicitarem a autorização do utilizador para a mesma. Tem a certeza de que deseja continuar?',
    },
  },
  guide: {
    third_party: {
      title: 'Integrar uma aplicação de terceiros',
      description:
        'Use o Logto como o seu Fornecedor de Identidade para fornecer autorização OAuth a serviços de terceiros. Inclui um ecrã de consentimento do utilizador pré-construído para acesso seguro aos recursos. <a>Saiba mais</a>',
    },
  },
};

export default Object.freeze(applications);
