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
    hide_logto_branding: 'Ocultar a marca Logto',
    hide_logto_branding_description:
      'Remova "Powered by Logto". Destaque apenas a sua marca com uma experiência de início de sessão limpa e profissional.',
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
    title: 'CENTRO DE CONTA',
    description: 'Personalize os fluxos do centro de conta com as APIs da Logto.',
    enable_account_api: 'Ativar a Account API',
    enable_account_api_description:
      'Ative a Account API para criar um centro de conta personalizado, dando aos utilizadores finais acesso direto à API sem utilizar a Logto Management API.',
    field_options: {
      off: 'Desligado',
      edit: 'Editar',
      read_only: 'Só de leitura',
      enabled: 'Ativo',
      disabled: 'Inativo',
    },
    sections: {
      account_security: {
        title: 'SEGURANÇA DA CONTA',
        description:
          'Gira o acesso à Account API para permitir que os utilizadores, depois de iniciarem sessão na aplicação, possam ver ou editar as suas informações de identidade e fatores de autenticação. Antes de efetuarem estas alterações relacionadas com a segurança, os utilizadores têm de verificar a identidade e obter um ID de registo de verificação válido durante 10 minutos.',
        groups: {
          identifiers: {
            title: 'Identificadores',
          },
          authentication_factors: {
            title: 'Fatores de autenticação',
          },
        },
      },
      user_profile: {
        title: 'PERFIL DO UTILIZADOR',
        description:
          'Gira o acesso à Account API para que os utilizadores possam ver ou editar dados de perfil básicos ou personalizados depois de iniciarem sessão na aplicação.',
        groups: {
          profile_data: {
            title: 'Dados de perfil',
          },
        },
      },
      secret_vault: {
        title: 'COFRE SECRETO',
        description:
          'Para conectores sociais e empresariais, armazene com segurança tokens de acesso de terceiros para chamar as respetivas APIs (por exemplo, adicionar eventos ao Google Agenda).',
        third_party_token_storage: {
          title: 'Token de terceiros',
          third_party_access_token_retrieval: 'Recuperação de token de acesso de terceiros',
          third_party_token_tooltip:
            'Para guardar tokens, ative esta opção nas definições do conector social ou empresarial correspondente.',
          third_party_token_description:
            'Depois de ativar a Account API, a recuperação de tokens de terceiros é acionada automaticamente.',
        },
      },
    },
    fields: {
      email: 'Endereço de email',
      phone: 'Número de telefone',
      social: 'Identidades sociais',
      password: 'Palavra-passe',
      mfa: 'Autenticação multifator',
      mfa_description:
        'Permita que os utilizadores gerem os métodos MFA a partir do centro de conta.',
      username: 'Nome de utilizador',
      name: 'Nome',
      avatar: 'Avatar',
      profile: 'Perfil',
      profile_description: 'Controle o acesso a atributos estruturados do perfil.',
      custom_data: 'Dados personalizados',
      custom_data_description:
        'Controle o acesso aos dados JSON personalizados guardados no utilizador.',
    },
    webauthn_related_origins: 'Origens relacionadas com WebAuthn',
    webauthn_related_origins_description:
      'Adicione os domínios das suas aplicações front-end autorizados a registar passkeys através da Account API.',
    webauthn_related_origins_error: 'A origem deve começar com https:// ou http://',
    prebuilt_ui: {
      /** UNTRANSLATED */
      title: 'INTEGRATE PREBUILT UI',
      /** UNTRANSLATED */
      description:
        'Quickly integrate out-of-the-box verification and security setting flows with prebuilt UI.',
      /** UNTRANSLATED */
      flows_title: 'Integrate out-of-the-box security setting flows',
      /** UNTRANSLATED */
      flows_description:
        'Combine your domain with the route to form your account setting URL (e.g., https://auth.foo.com/account/email). Optionally add a `redirect=` URL parameter to return users to your app after successfully updating.',
      tooltips: {
        /** UNTRANSLATED */
        email: 'Update your primary email address',
        /** UNTRANSLATED */
        phone: 'Update your primary phone number',
        /** UNTRANSLATED */
        username: 'Update your username',
        /** UNTRANSLATED */
        password: 'Set a new password',
        /** UNTRANSLATED */
        authenticator_app: 'Set up a new authenticator app for multi-factor authentication',
        /** UNTRANSLATED */
        passkey_add: 'Register a new passkey',
        /** UNTRANSLATED */
        passkey_manage: 'Manage your existing passkeys or add new ones',
        /** UNTRANSLATED */
        backup_codes_generate: 'Generate a new set of 10 backup codes',
        /** UNTRANSLATED */
        backup_codes_manage: 'View your available backup codes or generate new ones',
      },
      /** UNTRANSLATED */
      customize_note: "Don't want the out-of-the-box experience? You can fully",
      /** UNTRANSLATED */
      customize_link: 'customize your flows with the Account API instead.',
    },
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
    no_mfa_factor: 'Ainda não foi configurado nenhum fator de MFA. Configure em <a>{{link}}</a>.',
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
