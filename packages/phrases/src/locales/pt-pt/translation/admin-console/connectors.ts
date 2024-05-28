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
  connector_status: 'Experiência de login',
  connector_status_in_use: 'Em uso',
  connector_status_not_in_use: 'Fora de uso',
  not_in_use_tip: {
    content:
      'Não em uso significa que sua experiência de login não usou esse método de login. <a>{{link}}</a> para adicionar este método de login.',
    go_to_sie: 'Ir para experiência de login',
  },
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
    logo: 'URL do logo para o botão de login social',
    logo_placeholder: 'https://your.cdn.domain/logo.png',
    logo_tip:
      'A imagem do logo será exibida no conector. Obtenha um link de imagem publicamente acessível e insira o link aqui.',
    logo_dark: 'URL do logo para o botão de login social (modo escuro)',
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip:
      'Defina o logo do seu conector para o modo escuro depois de ativá-lo na Experiência de login no Console do administrador.',
    logo_dark_collapse: 'Fechar',
    logo_dark_show: 'Exibir configurações de logo para o modo escuro',
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
    callback_uri: 'URI de retorno',
    callback_uri_description:
      'Também chamado de URI de redirecionamento, é a URI no Logto para onde os usuários serão enviados após a autorização social, copie e cole na página de configuração do provedor social.',
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
};

export default Object.freeze(connectors);
