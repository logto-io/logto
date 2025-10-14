import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Experiência de login',
  page_title_with_account: 'Início de sessão e conta',
  title: 'Início de sessão e conta',
  description:
    'Personalize os fluxos de autenticação e a interface do usuário, e visualize a experiência pronta para uso em tempo real.',
  tabs: {
    branding: 'Marca',
    sign_up_and_sign_in: 'Registo e login',
    collect_user_profile: 'Recolher perfil do utilizador',
    account_center: 'Centro de contas',
    content: 'Conteúdo',
    password_policy: 'Política de senha',
  },
  welcome: {
    title: 'Personalize a experiência de início de sessão',
    description:
      'Comece rapidamente com a configuração do seu primeiro início de sessão. Este guia orienta-o através de todas as definições necessárias.',
    get_started: 'Começar',
    apply_remind: 'Observe que a experiência de login será aplicada a todos os apps nesta conta.',
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
    with_light: '{{value}}',
    with_dark: '{{value}} (dark)',
    app_logo_and_favicon: 'Logótipo e favicon do aplicativo',
    company_logo_and_favicon: 'Logótipo e favicon da empresa',
    organization_logo_and_favicon: 'Logótipo e favicon da organização',
  },
  branding_uploads: {
    app_logo: {
      title: 'Logótipo do aplicativo',
      url: 'URL do logótipo do aplicativo',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logótipo do aplicativo: {{error}}',
    },
    company_logo: {
      title: 'Logótipo da empresa',
      url: 'URL do logótipo da empresa',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logótipo da empresa: {{error}}',
    },
    organization_logo: {
      title: 'Carregar imagem',
      url: 'URL do logótipo da organização',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logótipo da organização: {{error}}',
    },
    connector_logo: {
      title: 'Carregar imagem',
      url: 'URL do logótipo do conector',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logótipo do conector: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'URL do Favicon',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: 'UI personalizada',
    css_code_editor_title: 'CSS personalizado',
    css_code_editor_description1: 'Veja um exemplo de CSS personalizado.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Saiba mais',
    css_code_editor_content_placeholder:
      'Insira o seu CSS personalizado para adaptar os estilos de qualquer coisa às suas especificações exatas. Exprima a sua criatividade e faça o seu UI se destacar.',
    bring_your_ui_title: 'Traga o seu UI',
    bring_your_ui_description:
      'Carregue um pacote comprimido (.zip) para substituir o UI predefinido do Logto pelo seu próprio código. <a>Saiba mais</a>',
    preview_with_bring_your_ui_description:
      'Os seus recursos de UI personalizados foram carregados com êxito e agora estão sendo servidos. Consequentemente, a janela de visualização incorporada foi desativada.\nPara testar o seu UI de início de sessão personalizado, clique no botão "Visualização ao vivo" para abri-lo num novo separador do navegador.',
  },
  account_center: {
    title: 'Centro de contas',
    description: 'Personaliza os fluxos do centro de contas com as APIs Logto.',
    enable_account_api: 'Ativar Account API',
    enable_account_api_description:
      'Ativa a Account API para criar um centro de contas personalizado, dando aos utilizadores acesso direto sem usar a Logto Management API.',
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
          'Para conectores sociais e empresariais, armazenamento seguro de tokens de acesso de terceiros para chamar as suas APIs (por exemplo, adicionar eventos ao Google Calendar).',
        third_party_token_storage: {
          title: 'Token de terceiros',
          third_party_access_token_retrieval: 'Token de terceiros',
          third_party_token_tooltip:
            'Para armazenar tokens, pode ativar isto nas definições do conector social ou empresarial correspondente.',
          third_party_token_description:
            'Assim que a Account API estiver ativada, a recuperação de tokens de terceiros é ativada automaticamente.',
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
      'Adicione os domínios das suas aplicações front-end que estão autorizados a registar chaves de acesso através da API de conta.',
    webauthn_related_origins_error: 'A origem deve começar com https:// ou http://',
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'Ainda não foi configurado nenhum conector SMS. Antes de concluir a configuração, os utilizadores não poderão iniciar sessão com este método. <a>{{link}}</a> em "Conectores"',
    no_connector_email:
      'Ainda não foi configurado qualquer conector de email. Antes de concluir a configuração, os utilizadores não poderão iniciar sessão com este método. <a>{{link}}</a> em "Conectores"',
    no_connector_social:
      'Você ainda não configurou nenhum conector social. Adicione conectores primeiro para aplicar métodos de login social. <a>{{link}}</a> em "Conectores".',
    no_connector_email_account_center:
      'Ainda não foi configurado qualquer conector de e-mail. Configure em <a>"Conectores de e-mail e SMS"</a>.',
    no_connector_sms_account_center:
      'Ainda não foi configurado qualquer conector SMS. Configure em <a>"Conectores de e-mail e SMS"</a>.',
    no_connector_social_account_center:
      'Ainda não foi configurado qualquer conector social. Configure em <a>"Conectores sociais"</a>.',
    no_mfa_factor:
      'Ainda não foi configurado nenhum fator de MFA. <a>{{link}}</a> em "Autenticação multifator".',
    setup_link: 'Configurar',
  },
  save_alert: {
    description:
      'Está a implementar novos procedimentos de início de sessão e registo. Todos os seus utilizadores podem ser afetados pela nova configuração. Tem a certeza de que quer confirmar a alteração?',
    before: 'Antes',
    after: 'Depois',
    sign_up: 'Registo',
    sign_in: 'Iniciar sessão',
    social: 'Social',
    forgot_password_migration_notice:
      'Atualizámos a verificação de palavra-passe esquecida para suportar métodos personalizados. Anteriormente, isto era automaticamente determinado pelos seus conectores de Email e SMS. Clique em <strong>Confirmar</strong> para concluir a atualização.',
  },
  preview: {
    title: 'Visualização prévia do login',
    live_preview: 'Visualização ao vivo',
    live_preview_tip: 'Guardar para visualizar as alterações',
    native: 'App nativa',
    desktop_web: 'Web no computador',
    mobile_web: 'Web no telemóvel',
    desktop: 'Ambiente de trabalho',
    mobile: 'Móvel',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
