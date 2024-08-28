const connectors = {
  page_title: 'Conectores',
  title: 'Conectores',
  subtitle: 'Configure conectores para habilitar a experiência de login social e sem senha',
  create: 'Adicionar conector social',
  config_sie_notice:
    'Você configurou os conectores. Certifique-se de configurá-lo em <a>{{link}}</a>.',
  config_sie_link_text: 'experiência de login',
  tab_email_sms: 'Conectores de E-mail e SMS',
  tab_social: 'Conectores sociais',
  connector_name: 'Nome do conector',
  demo_tip:
    'O número máximo de mensagens permitidas para este conector de demonstração é limitado a 100 e não é recomendado para implantação em um ambiente de produção.',
  social_demo_tip:
    'O conector de demonstração é projetado exclusivamente para fins de demonstração e não é recomendado para implantação em um ambiente de produção.',
  connector_type: 'Tipo',
  connector_status: 'Experiência de login',
  connector_status_in_use: 'Em uso',
  connector_status_not_in_use: 'Fora de uso',
  not_in_use_tip: {
    content:
      'Fora de uso significa que sua experiência de login não usou esse método de login. <a>{{link}}</a> para adicionar este método de login. ',
    go_to_sie: 'Vá para a experiência de login',
  },
  placeholder_title: 'Conector social',
  placeholder_description:
    'Logto tem fornecido muitos conectores de login social amplamente utilizados enquanto você pode criar o seu próprio com padrões padrão.',
  save_and_done: 'Salvar e completar',
  type: {
    email: 'Conector de e-mail',
    sms: 'Conector de SMS',
    social: 'Conector social',
  },
  setup_title: {
    email: 'Configurar conector de e-mail',
    sms: 'Configurar conector SMS',
    social: 'Adicionar conector social',
  },
  guide: {
    subtitle: 'Um guia passo a passo para configurar seu conector',
    general_setting: 'Configurações gerais',
    parameter_configuration: 'Configuração de parâmetros',
    test_connection: 'Teste de conexão',
    name: 'Nome do botão de login social',
    name_placeholder: 'Insira o nome do botão de login social',
    name_tip: 'O nome do botão do conector será exibido como "Continuar com {{Nome do Conector}}".',
    logo: 'URL do logo para o botão de login social',
    logo_placeholder: 'https://your.cdn.domain/logo.png',
    logo_tip: 'A imagem do logotipo também será exibida no botão do conector.',
    logo_dark: 'URL do logo para o botão de login social (modo escuro)',
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip:
      'Defina o logotipo do seu conector para o modo escuro depois de ativá-lo na Experiência de login do Console de Administração.',
    logo_dark_collapse: 'Expandir',
    logo_dark_show: 'Mostrar configuração de logotipo para modo escuro',
    target: 'Nome do fornecedor de identidade',
    target_placeholder: 'Insira o nome do fornecedor de identidade do conector',
    target_tip:
      'O valor de "Nome do fornecedor de identidade" pode ser uma string de identificador exclusiva para distinguir suas identidades sociais.',
    target_tip_standard:
      'O valor de "Nome do fornecedor de identidade" pode ser uma string de identificador exclusiva para distinguir suas identidades sociais. Essa configuração não pode ser alterada após a criação do conector.',
    target_tooltip:
      '"Target" nos conectores sociais Logto refere-se à "origem" de suas identidades sociais. No design do Logto, não aceitamos o mesmo "target" de uma plataforma específica para evitar conflitos. Você deve tomar muito cuidado antes de adicionar um conector, pois NÃO PODE mudar seu valor depois de criá-lo. <a>Saiba mais</a>',
    target_conflict:
      'O nome de IdP inserido corresponde ao <span>nome</span> existente. Usar o mesmo nome do IDP pode causar comportamento inesperado ao entrar onde os usuários podem acessar a mesma conta por meio de dois conectores diferentes.',
    target_conflict_line2:
      'Se você deseja substituir o conector atual pelo mesmo fornecedor de identidade e permitir que usuários antigos façam login sem se registrar novamente, exclua o conector <span>nome</span> e crie um novo com o mesmo "Nome do fornecedor de identidade".',
    target_conflict_line3:
      'Se você deseja se conectar a um provedor de identidade diferente, modifique o "Nome do fornecedor de identidade" e prossiga.',
    config: 'Digite seu JSON aqui',
    sync_profile: 'Sincronizar informações de perfil',
    sync_profile_only_at_sign_up: 'Sincronizar apenas no registro',
    sync_profile_each_sign_in: 'Sempre sincronizar a cada login',
    sync_profile_tip:
      'Sincronize o perfil básico do provedor social, como os nomes dos usuários e seus avatares.',
    callback_uri: 'URI de retorno do chamado',
    callback_uri_description:
      'Também chamado de URI de redirecionamento, é a URI no Logto para a qual os usuários serão enviados de volta após a autorização social; copie e cole na página de configuração do provedor social.',
    acs_url: 'URL do serviço de consumo de afirmações',
  },
  platform: {
    universal: 'Universal',
    web: 'Web',
    native: 'Nativo',
  },
  add_multi_platform: 'suporta várias plataformas, selecione uma plataforma para continuar',
  drawer_title: 'Guia do Conector',
  drawer_subtitle: 'Siga as instruções para integrar seu conector',
  unknown: 'Conector desconhecido',
  standard_connectors: 'Conectores padrão',
};

export default Object.freeze(connectors);
