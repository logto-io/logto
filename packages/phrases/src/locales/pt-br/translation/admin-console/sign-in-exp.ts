const sign_in_exp = {
  title: 'Experiência de login',
  description:
    'Personalize a interface do usuário de login para corresponder à sua marca e visualize em tempo real',
  tabs: {
    branding: 'Marca',
    sign_up_and_sign_in: 'Inscreva-se e faça login',
    others: 'Outros',
  },
  welcome: {
    title: 'Customize sign-in experience', // UNTRANSLATED
    description:
      'Get started fast with your first sign-in setup. This guide walks you through all the necessary settings.', // UNTRANSLATED
    get_started: 'Iniciar',
    apply_remind:
      'Observe que a experiência de login será aplicada a todos os aplicativos nesta conta.',
  },
  color: {
    title: 'COR',
    primary_color: 'Cor da marca',
    dark_primary_color: 'Cor da marca (Escuro)',
    dark_mode: 'Ativar modo escuro',
    dark_mode_description:
      'Seu aplicativo terá um tema de modo escuro gerado automaticamente com base na cor da sua marca e no algoritmo Logto. Você é livre para personalizar.',
    dark_mode_reset_tip: 'Recalcule a cor do modo escuro com base na cor da marca.',
    reset: 'Recalcular',
  },
  branding: {
    title: 'ÁREA DE MARCA',
    ui_style: 'Estilo',
    favicon: 'Browser favicon', // UNTRANSLATED
    logo_image_url: 'URL da imagem do logotipo do aplicativo',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'URL da imagem do logotipo do aplicativo (Escuro)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    logo_image: 'App logo', // UNTRANSLATED
    dark_logo_image: 'App logo (Dark)', // UNTRANSLATED
    logo_action_description: 'App Logo to display in UI interface', // UNTRANSLATED
    favicon_action_description: 'Browser Favicon', // UNTRANSLATED
    logo_image_error: 'App logo: {{error}}', // UNTRANSLATED
    favicon_error: 'Favicon: {{error}}', // UNTRANSLATED
  },
  custom_css: {
    title: 'CUSTOM CSS', // UNTRANSLATED
    css_code_editor_title: 'Custom CSS to change UI', // UNTRANSLATED
    css_code_editor_description: 'Description - Doc. <a>{{link}}</a>', // UNTRANSLATED
    css_code_editor_description_link_content: 'Readme', // UNTRANSLATED
  },
  sign_up_and_sign_in: {
    identifiers_email: 'Endereço de e-mail',
    identifiers_phone: 'Número de telefone',
    identifiers_username: 'Nome de usuário',
    identifiers_email_or_sms: 'Endereço de e-mail ou número de telefone',
    identifiers_none: 'Não aplicável',
    and: 'e',
    or: 'ou',
    sign_up: {
      title: 'INSCREVER-SE',
      sign_up_identifier: 'Identificador de inscrição',
      identifier_description:
        'O identificador de inscrição é necessário para a criação da conta e deve ser incluído na tela de login.',
      sign_up_authentication: 'Configuração de autenticação para inscrição',
      authentication_description:
        'Todas as ações selecionadas serão obrigatórias para os usuários completarem o fluxo.',
      set_a_password_option: 'Crie sua senha',
      verify_at_sign_up_option: 'Visualize na inscrição',
      social_only_creation_description: '(Isso se aplica apenas à criação de contas sociais)',
    },
    sign_in: {
      title: 'ENTRAR',
      sign_in_identifier_and_auth: 'Configurações de identificador e autenticação para login',
      description:
        'Os usuários podem entrar usando qualquer uma das opções disponíveis. Ajuste o layout arrastando e soltando as opções abaixo.',
      add_sign_in_method: 'Adicionar método de login',
      password_auth: 'Senha',
      verification_code_auth: 'Código de verificação',
      auth_swap_tip: 'Troque as opções abaixo para determinar qual aparece primeiro no fluxo.',
      require_auth_factor: 'Você deve selecionar pelo menos um fator de autenticação.',
    },
    social_sign_in: {
      title: 'LOGIN SOCIAL',
      social_sign_in: 'Login social',
      description:
        'Dependendo do identificador obrigatório que você configurou, seu usuário pode ser solicitado a fornecer um identificador ao se inscrever via conector social.',
      add_social_connector: 'Adicionar Conector Social',
      set_up_hint: {
        not_in_list: 'Não está na lista?',
        set_up_more: 'Configurar',
        go_to: 'outros conectores sociais agora.',
      },
    },
    tip: {
      set_a_password:
        'Um conjunto exclusivo de uma senha para o seu nome de usuário é obrigatório.',
      verify_at_sign_up:
        'No momento, suportamos apenas e-mail verificado. Sua base de usuários pode conter um grande número de endereços de e-mail de baixa qualidade se não houver validação.',
      password_auth:
        'Isso é essencial, pois você habilitou a opção de definir uma senha durante o processo de inscrição.',
      verification_code_auth:
        'Isso é essencial, pois você habilitou apenas a opção de fornecer o código de verificação ao se inscrever. Você pode desmarcar a caixa quando a configuração de senha for permitida no processo de inscrição.',
      delete_sign_in_method:
        'Isso é essencial, pois você selecionou {{identifier}} como um identificador obrigatório.',
    },
  },
  others: {
    terms_of_use: {
      title: 'TERMOS DE USO',
      terms_of_use: 'Termos de uso',
      terms_of_use_placeholder: 'https://your.terms.of.use/',
      terms_of_use_tip: 'URL dos termos de uso',
      privacy_policy: 'Política de privacidade',
      privacy_policy_placeholder: 'https://your.privacy.policy/',
      privacy_policy_tip: 'URL da política de privacidade',
    },
    languages: {
      title: 'IDIOMAS',
      enable_auto_detect: 'Ativar detecção automática',
      description:
        'Seu software detecta a configuração de localidade do usuário e muda para o idioma local. Você pode adicionar novos idiomas traduzindo a interface do usuário do inglês para outro idioma.',
      manage_language: 'Gerenciar idioma',
      default_language: 'Idioma padrão',
      default_language_description_auto:
        'O idioma padrão será usado quando o idioma do usuário detectado não estiver coberto na biblioteca de idiomas atual.',
      default_language_description_fixed:
        'Quando a detecção automática está desativada, o idioma padrão é o único idioma que seu software mostrará. Ative a detecção automática de extensão de idioma.',
    },
    manage_language: {
      title: 'Gerenciar idioma',
      subtitle:
        'Localize a experiência do produto adicionando idiomas e traduções. Sua contribuição pode ser definida como o idioma padrão.',
      add_language: 'Adicionar idioma',
      logto_provided: 'Fornecido por Logto',
      key: 'Chave',
      logto_source_values: 'Valores Logto',
      custom_values: 'Valores personalizados',
      clear_all_tip: 'Limpar todos os valores',
      unsaved_description: 'As alterações não serão salvas se você sair desta página sem salvar.',
      deletion_tip: 'Excluir o idioma',
      deletion_title: 'Deseja excluir o idioma adicionado?',
      deletion_description:
        'Após a exclusão, seus usuários não poderão navegar naquele idioma novamente.',
      default_language_deletion_title: 'O idioma padrão não pode ser excluído.',
      default_language_deletion_description:
        '{{language}} está definido como seu idioma padrão e não pode ser excluído. ',
    },
    advanced_options: {
      title: 'OPÇÕES AVANÇADAS',
      enable_user_registration: 'Ativar registro de usuário',
      enable_user_registration_description:
        'Habilitar ou desabilitar o registro do usuário. Depois de desativados, os usuários ainda podem ser adicionados no Admin Console, mas os usuários não podem mais estabelecer contas por meio da interface do usuário de login.',
    },
  },
  setup_warning: {
    no_connector_sms:
      'Nenhum conector SMS configurado ainda. Até terminar de configurar seu conector SMS, você não poderá fazer login. <a>{{link}}</a> em "Conectores"',
    no_connector_email:
      'Nenhum conector e-mail configurado ainda. Até terminar de configurar seu conector SMS, você não poderá fazer login. <a>{{link}}</a> em "Conectores"',
    no_connector_social:
      'Nenhum conector social configurado ainda. Até terminar de configurar seu conector SMS, você não poderá fazer login. <a>{{link}}</a> em "Conectores"',
    no_added_social_connector:
      'Você configurou alguns conectores sociais agora. Certifique-se de adicionar alguns à sua experiência de login.',
    setup_link: 'Configurar',
  },
  save_alert: {
    description:
      'Você está implementando novos procedimentos de entrada e inscrição. Todos os seus usuários podem ser afetados pela nova configuração. Tem certeza de se comprometer com a mudança?',
    before: 'Antes',
    after: 'Depois',
    sign_up: 'Inscrever-se',
    sign_in: 'Entrar',
    social: 'Social',
  },
  preview: {
    title: 'Visualização de login',
    live_preview: 'Live preview', // UNTRANSLATED
    live_preview_tip: 'Save to preview changes', // UNTRANSLATED
    native: 'Native',
    desktop_web: 'Desktop Web',
    mobile_web: 'Mobile Web',
  },
};

export default sign_in_exp;
