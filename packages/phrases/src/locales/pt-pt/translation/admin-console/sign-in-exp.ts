const sign_in_exp = {
  title: 'Experiência de login',
  description:
    'Personalize a interface de login para corresponder a sua marca e visualize em tempo real',
  tabs: {
    branding: 'Marca',
    methods: 'Métodos de login',
    others: 'Outros',
  },
  welcome: {
    title:
      'Esta é a primeira vez que define a experiência de login. Este guia irá ajudá-lo a passar por todas as configurações necessárias e começar rapidamente.',
    get_started: 'Começar',
    apply_remind: 'Observe que a experiência de login será aplicada a todos os apps nesta conta.',
    got_it: 'Entendi',
  },
  color: {
    title: 'COR',
    primary_color: 'Cor da marca',
    dark_primary_color: 'Cor da marca (tema escuro)',
    dark_mode: 'Ativar tema escuro',
    dark_mode_description:
      'O app terá um tema escuro gerado automaticamente com base na cor da marca e no algoritmo Logto. contudo é livre de personalizar.',
    dark_mode_reset_tip: 'Recalcular a cor do tema escuro com base na cor da marca.',
    reset: 'Recalcular',
  },
  branding: {
    title: 'ÁREA DE MARCA',
    ui_style: 'Estilo',
    styles: {
      logo_slogan: 'Logo da app com slogan',
      logo: 'Apenas o logo da app',
    },
    logo_image_url: 'URL do logotipo da app',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'URL do logotipo da app (tema escuro)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    slogan: 'Slogan',
    slogan_placeholder: 'Liberte a sua criatividade',
  },
  sign_in_methods: {
    title: 'MÉTODOS DE LOGIN',
    primary: 'Método de login principal',
    enable_secondary: 'Ativar login secundário',
    enable_secondary_description:
      'Depois de ativado, a sua app oferecerá suporte a mais métodos de login além do principal. ',
    methods: 'Método de login',
    methods_sms: 'SMS',
    methods_email: 'Email',
    methods_social: 'Rede social',
    methods_username: 'Utilizador e password',
    methods_primary_tag: '(Primário)',
    define_social_methods: 'Definir métodos de login social',
    transfer: {
      title: 'Conectores sociais',
      footer: {
        not_in_list: 'Não está na lista?',
        set_up_more: 'Configurar mais',
        go_to: 'conectores sociais ou vá para a seção "Conectores".',
      },
    },
  },
  others: {
    terms_of_use: {
      title: 'TERMOS DE USO',
      enable: 'Ativar termos de uso',
      description: 'Adicione os termos legais para uso do seu produto',
      terms_of_use: 'Termos de uso',
      terms_of_use_placeholder: 'https://your.terms.of.use/',
      terms_of_use_tip: 'URL dos termos de uso',
    },
    languages: {
      title: 'LÍNGUAS',
      enable_auto_detect: 'Enable auto detect', // UNTRANSLATED
      description:
        "Your software detects the user's location and switches to the local language. You can add new locales by translating UI from English to another language.", // UNTRANSLATED
      manage_language: 'Manage language', // UNTRANSLATED
      default_language: 'Default language', // UNTRANSLATED
      default_language_description_auto:
        'The default language will be used when a text segment is missing translation.', // UNTRANSLATED
      default_language_description_fixed:
        'When auto detect is off, the default language is the only language your software will show. Turn on auto detect for language customization.', // UNTRANSLATED
    },
    authentication: {
      title: 'AUTENTICAÇÃO',
      enable_create_account: 'Permitir criar conta?',
      enable_create_account_description:
        'Ativa ou desativa a criação de contas. Depois de desativado, os seus clientes não poderão criar contas por meio da pagina de login, mas você poderá adicionar utiizadores na Consola de Administrador.',
    },
  },
  setup_warning: {
    no_connector: '',
    no_connector_sms:
      'Ainda não configurou um conector de SMS. A experiência de login não será ativada até que conclua as configurações primeiro. ',
    no_connector_email:
      'Ainda não configurou um conector de email. A experiência de login não será ativada até que conclua as configurações primeiro. ',
    no_connector_social:
      'Ainda não configurou um conector social. A experiência de login não será ativada até que conclua as configurações primeiro. ',
    no_added_social_connector:
      'Configurou alguns conectores sociais agora. Certifique-se de adicionar alguns a experiência de login.',
  },
  save_alert: {
    description:
      'Está alterando os métodos de login. Isso afetará alguns dos seus utilizadoress. Tem a certeza que deseja fazer isso?',
    before: 'Antes',
    after: 'Depois',
  },
  preview: {
    title: 'Pre-visualização do login',
    dark: 'Escuro',
    light: 'Claro',
    native: 'Nativo',
    desktop_web: 'Web computador',
    mobile_web: 'Web móvel',
  },
};

export default sign_in_exp;
