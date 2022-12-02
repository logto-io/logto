const connectors = {
  title: 'Conectores',
  subtitle: 'Configure conectores para habilitar a experiência de login social e sem senha',
  create: 'Adicionar conector social',
  config_sie_notice:
    'Você configurou os conectores. Certifique-se de configurá-lo em <a>{{link}}</a>.',
  config_sie_link_text: 'experiência de login',
  tab_email_sms: 'Conectores de e-mail e SMS',
  tab_social: 'Conectores sociais',
  connector_name: 'Nome do conector',
  connector_type: 'Tipo',
  connector_status: 'Experiência de login',
  connector_status_in_use: 'Em uso',
  connector_status_not_in_use: 'Fora de uso',
  not_in_use_tip: {
    content:
      'Fora de uso significa que sua experiência de login não usou esse método de login. <a>{{link}}</a> para adicionar este método de login. ',
    go_to_sie: 'Vá para a experiência de login',
  },
  social_connector_eg: 'Ex: Google, Facebook, Github',
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
    connector_setting: 'Configuração do conector',
    name: 'Nome do conector',
    name_tip: 'O nome do botão do conector será exibido como "Continue com {{Connector Name}}".',
    logo: 'URL do logotipo do conector',
    logo_placelholder: 'https://your.cdn.domain/logo.png',
    logo_tip: 'A imagem do logotipo também será exibida no botão do conector.',
    logo_dark: 'URL do logotipo do conector (modo escuro)',
    logo_dark_placelholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip:
      'Isso será usado ao abrir "Ativar modo escuro" na configuração da experiência de login.',
    logo_dark_collapse: 'Collapse',
    logo_dark_show: 'Mostrar "Logo para modo escuro"',
    target: 'Destino da identidade do conector',
    target_tip: 'Um identificador exclusivo para o conector.',
    config: 'Digite seu JSON aqui',
  },
  platform: {
    universal: 'Universal',
    web: 'Web',
    native: 'Native',
  },
  add_multi_platform: ' suporta várias plataformas, selecione uma plataforma para continuar',
  drawer_title: 'Guia do Conector',
  drawer_subtitle: 'Siga as instruções para integrar seu conector',
};

export default connectors;
