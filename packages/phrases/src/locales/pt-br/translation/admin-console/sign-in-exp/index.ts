import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Experiência de login',
  page_title_with_account: 'Login e conta',
  title: 'Login e conta',
  description:
    'Personalize os fluxos de autenticação e a interface do usuário, e visualize a experiência pronta para uso em tempo real.',
  tabs: {
    branding: 'Marca',
    sign_up_and_sign_in: 'Inscreva-se e faça login',
    collect_user_profile: 'Coletar perfil do usuário',
    account_center: 'Centro de contas',
    content: 'Conteúdo',
    password_policy: 'Política de senhas',
  },
  welcome: {
    title: 'Personalize a experiência de login',
    description:
      'Comece rapidamente com a configuração do seu primeiro login. Este guia o acompanhará em todas as configurações necessárias.',
    get_started: 'Começar',
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
    with_light: '{{value}}',
    with_dark: '{{value}} (escuro)',
    app_logo_and_favicon: 'Logo do aplicativo e favicon',
    company_logo_and_favicon: 'Logo da empresa e favicon',
    organization_logo_and_favicon: 'Logo da organização e favicon',
  },
  branding_uploads: {
    app_logo: {
      title: 'Logo do aplicativo',
      url: 'URL do logo do aplicativo',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo do aplicativo: {{error}}',
    },
    company_logo: {
      title: 'Logo da empresa',
      url: 'URL do logo da empresa',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo da empresa: {{error}}',
    },
    organization_logo: {
      title: 'Upload de imagem',
      url: 'URL do logo da organização',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo da organização: {{error}}',
    },
    connector_logo: {
      title: 'Upload de imagem',
      url: 'URL do logo do conector',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo do conector: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'URL do favicon',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: 'UI personalizado',
    css_code_editor_title: 'CSS personalizado',
    css_code_editor_description1: 'Veja o exemplo de CSS personalizado.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Saiba mais',
    css_code_editor_content_placeholder:
      'Insira seu CSS personalizado para ajustar os estilos de qualquer coisa conforme suas especificações exatas. Expresse sua criatividade e faça sua UI se destacar.',
    bring_your_ui_title: 'Traga sua UI',
    bring_your_ui_description:
      'Carregue um pacote compactado (.zip) para substituir a UI pré-construída do Logto pelo seu próprio código. <a>Saiba mais</a>',
    preview_with_bring_your_ui_description:
      'Seus ativos de UI personalizados foram carregados com sucesso e agora estão sendo servidos. Consequentemente, a janela de visualização interna foi desativada.\nPara testar sua UI de login personalizada, clique no botão "Visualização em tempo real" para abri-la em uma nova aba do navegador.',
  },
  account_center: {
    title: 'Centro de contas',
    description: 'Personalize os fluxos do centro de contas com as APIs Logto.',
    enable_account_api: 'Ativar Account API',
    enable_account_api_description:
      'Ative a Account API para criar um centro de contas personalizado e oferecer aos usuários finais acesso direto sem usar a Logto Management API.',
    field_options: {
      off: 'Off',
      edit: 'Edit',
      read_only: 'Read only',
      enabled: 'Ativado',
      disabled: 'Desativado',
    },
    sections: {
      account_security: {
        title: 'ACCOUNT SECURITY',
        description:
          'Manage access to the Account API, enabling users to view or edit their identity information and authentication factors after signing into the application. Users must verify their identity to get a valid 10-minute verification record ID before making these security-related changes.',
        groups: {
          identifiers: {
            title: 'Identifiers',
          },
          authentication_factors: {
            title: 'Authentication factors',
          },
        },
      },
      user_profile: {
        title: 'USER PROFILE',
        description:
          'Manage access to the Account API, enabling users to view or edit basic or custom profile data after signing into the application.',
        groups: {
          profile_data: {
            title: 'Profile data',
          },
        },
      },
      secret_vault: {
        title: 'COFRE SECRETO',
        description:
          'Para conectores sociais e empresariais, armazene com segurança tokens de acesso de terceiros para chamar suas APIs (por exemplo, adicionar eventos ao Google Calendar).',
        third_party_token_storage: {
          title: 'Token de terceiros',
          third_party_access_token_retrieval: 'Token de terceiros',
          third_party_token_tooltip:
            'Para armazenar tokens, você pode habilitar isso nas configurações do conector social ou empresarial correspondente.',
          third_party_token_description:
            'Uma vez que a Account API esteja ativada, a recuperação de tokens de terceiros é ativada automaticamente.',
        },
      },
    },
    fields: {
      email: 'Email address',
      phone: 'Phone number',
      social: 'Social identities',
      password: 'Password',
      mfa: 'Multi-factor authentication',
      mfa_description: 'Let users manage their MFA methods from the account center.',
      username: 'Username',
      name: 'Name',
      avatar: 'Avatar',
      profile: 'Profile',
      profile_description: 'Control access to structured profile attributes.',
      custom_data: 'Custom data',
      custom_data_description: 'Control access to custom JSON data stored on the user.',
    },
    webauthn_related_origins: 'Origens relacionadas ao WebAuthn',
    webauthn_related_origins_description:
      'Adicione os domínios de seus aplicativos front-end que têm permissão para registrar chaves de acesso por meio da API de conta.',
    webauthn_related_origins_error: 'A origem deve começar com https:// ou http://',
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'Nenhum conector SMS configurado ainda. Até terminar de configurar seu conector SMS, seus usuários não poderão fazer login. <a>{{link}}</a> em "Conectores"',
    no_connector_email:
      'Nenhum conector de e-mail configurado ainda. Até terminar de configurar seu conector de e-mail, seus usuários não poderão fazer login. <a>{{link}}</a> em "Conectores"',
    no_connector_social:
      'Você ainda não configurou nenhum conector social. Adicione conectores primeiro para aplicar métodos de login social. <a>{{link}}</a> em "Conectores".',
    no_connector_email_account_center:
      'Nenhum conector de e-mail configurado ainda. Configure em <a>"Conectores de e-mail e SMS"</a>.',
    no_connector_sms_account_center:
      'Nenhum conector SMS configurado ainda. Configure em <a>"Conectores de e-mail e SMS"</a>.',
    no_connector_social_account_center:
      'Nenhum conector social configurado ainda. Configure em <a>"Conectores sociais"</a>.',
    no_mfa_factor:
      'Nenhum fator de MFA configurado ainda. <a>{{link}}</a> em "Autenticação multifator".',
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
    forgot_password_migration_notice:
      'Atualizamos a verificação de senha esquecida para suportar métodos personalizados. Anteriormente, isso era determinado automaticamente pelos seus conectores de Email e SMS. Clique em <strong>Confirmar</strong> para concluir a atualização.',
  },
  preview: {
    title: 'Visualização de login',
    live_preview: 'Visualização em tempo real',
    live_preview_tip: 'Salve para visualizar as alterações',
    native: 'Nativo',
    desktop_web: 'Web Desktop',
    mobile_web: 'Web Mobile',
    desktop: 'Área de trabalho',
    mobile: 'Móvel',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
