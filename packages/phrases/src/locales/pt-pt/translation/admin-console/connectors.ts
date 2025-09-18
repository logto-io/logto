const connectors = {
  page_title: 'Conectores',
  title: 'Conectores',
  subtitle: 'Configure conectores para habilitar a experiência de login social e sem senha',
  create: 'Adicionar conector social',
  config_sie_notice:
    'Você configurou conectores. Certifique-se de configurá-lo em <a>{{link}}</a>.',
  config_sie_link_text: 'experiência de login',
  tab_email_sms: 'Conectores de Email e SMS',
  tab_social: 'Conectores sociais',
  connector_name: 'Nome do conector',
  demo_tip:
    'O número máximo de mensagens permitido para este conector de demonstração é limitado a 100 e não é recomendado para implantação em um ambiente de produção.',
  social_demo_tip:
    'O conector de demonstração é projetado exclusivamente para fins de demonstração e não é recomendado para implantação em um ambiente de produção.',
  connector_type: 'Tipo',
  placeholder_title: 'Conector social',
  placeholder_description:
    'O Logto forneceu muitos conectores de login social amplamente usados, enquanto isso, você pode criar o seu próprio com protocolos padrão.',
  save_and_done: 'Guardar',
  type: {
    email: 'Email',
    sms: 'SMS',
    social: 'Social',
  },
  setup_title: {
    email: 'Configurar o conector de email',
    sms: 'Configurar o conector de SMS',
    social: 'Adicionar conector social',
  },
  guide: {
    subtitle: 'Um guia passo a passo para configurar o conector',
    general_setting: 'Configurações gerais',
    parameter_configuration: 'Configuração de parâmetros',
    test_connection: 'Teste de conexão',
    name: 'Nome do botão de login social',
    name_placeholder: 'Insira o nome do botão de login social',
    name_tip:
      'O nome do botão do conector será exibido como "Continuar com {{name}}." Esteja atento ao comprimento da nomenclatura caso ela fique muito longa.',
    connector_logo: 'Logotipo do conector',
    connector_logo_tip: 'O logotipo será exibido no botão de login do conector.',
    target: 'Nome do provedor de identidade',
    target_placeholder: 'Insira o nome do provedor de identidade do conector',
    target_tip:
      'O valor do "nome do IdP" pode ser uma string de identificador exclusivo para distinguir suas identidades sociais.',
    target_tip_standard:
      'O valor do "nome do IdP" pode ser uma string de identificador exclusivo para distinguir suas identidades sociais. Esta configuração não pode ser alterada depois que o conector for criado.',
    target_tooltip:
      '"Target" nos conectores sociais do Logto refere-se à "origem" de suas identidades sociais. No design do Logto, não aceitamos o mesmo "alvo" de uma plataforma específica para evitar conflitos. Você deve ter muito cuidado antes de adicionar um conector, pois NÃO PODE alterar seu valor depois de criá-lo. <a>Saiba mais</a>',
    target_conflict:
      'O nome do IdP inserido corresponde ao <span>nome</span> existente. Usar o mesmo nome de idp pode causar um comportamento de login inesperado em que os usuários podem acessar a mesma conta por meio de dois conectores diferentes.',
    target_conflict_line2:
      'Se você deseja substituir o conector atual pelo mesmo provedor de identidade e permitir que os usuários anteriores façam login sem se registrar novamente, exclua o conector <span>nome</span> e crie um novo com o mesmo "nome do IdP".',
    target_conflict_line3:
      'Se você deseja se conectar a um provedor de identidade diferente, modifique o "nome do IdP" e prossiga.',
    config: 'Insira o seu JSON de configuração',
    sync_profile: 'Sincronizar informações do perfil',
    sync_profile_only_at_sign_up: 'Sincronizar apenas no registro',
    sync_profile_each_sign_in: 'Sempre sincronizar em cada login',
    sync_profile_tip:
      'Sincronize o perfil básico do provedor social, como os nomes dos usuários e seus avatares.',
    enable_token_storage: {
      title: 'Armazenar tokens para acesso persistente à API',
      description:
        'Armazene tokens de acesso e de atualização no Cofre Seguro. Permite chamadas de API automatizadas sem o consentimento repetido do usuário. Exemplo: permita que seu Agente de IA adicione eventos ao Google Calendar com autorização persistente. <a>Saiba como chamar APIs de terceiros</a>',
    },
    callback_uri: 'URI de redirecionamento (URI de retorno)',
    callback_uri_description:
      'A URI de redirecionamento é para onde os utilizadores são enviados após a autorização social. Adicione esta URI à configuração do seu IdP.',
    callback_uri_custom_domain_description:
      'Se utilizar vários <a>domínios personalizados</a> no Logto, certifique-se de adicionar todas as URIs de callback correspondentes ao seu IdP para que o início de sessão social funcione em cada domínio.\n\nO domínio predefinido do Logto (*.logto.app) é sempre válido; inclua-o apenas se também quiser suportar inícios de sessão nesse domínio.',
    acs_url: 'URL do serviço do consumidor de afirmação',
  },
  platform: {
    universal: 'Universal',
    web: 'Web',
    native: 'Nativo',
  },
  add_multi_platform: 'suporta várias plataformas, selecione uma plataforma para continuar',
  drawer_title: 'Guia do conector',
  drawer_subtitle: 'Siga as instruções para integrar o conector',
  unknown: 'Conector desconhecido',
  standard_connectors: 'Conectores padrão',
  create_form: {
    third_party_connectors:
      'Integre provedores de terceiros para login social rápido, vinculação de contas sociais e acesso a API. <a>Saiba mais</a>',
    standard_connectors: 'Ou você pode personalizar seu conector social por um protocolo padrão.',
  },
};

export default Object.freeze(connectors);
