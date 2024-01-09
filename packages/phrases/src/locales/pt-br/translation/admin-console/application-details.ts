const application_details = {
  page_title: 'Detalhes da aplicação',
  back_to_applications: 'Voltar para Aplicativos',
  check_guide: 'Visualizar o guia',
  settings: 'Configurações',
  settings_description:
    'Os aplicativos são usados para identificar seus aplicativos no Logto para OIDC, experiência de login, logs de auditoria, etc.',
  /** UNTRANSLATED */
  endpoints_and_credentials: 'Endpoints & Credentials',
  /** UNTRANSLATED */
  endpoints_and_credentials_description:
    'Use the following endpoints and credentials to set up the OIDC connection in your application.',
  /** UNTRANSLATED */
  refresh_token_settings: 'Refresh token',
  /** UNTRANSLATED */
  refresh_token_settings_description: 'Manage the refresh token rules for this application.',
  application_roles: 'Funções do aplicativo',
  machine_logs: 'Logs da máquina',
  application_name: 'Nome do aplicativo',
  application_name_placeholder: 'Meu aplicativo',
  description: 'Descrição',
  description_placeholder: 'Digite a descrição do seu aplicativo',
  config_endpoint: 'Endpoint de configuração do OpenID Provider',
  authorization_endpoint: 'Endpoint de autorização',
  authorization_endpoint_tip:
    'O endpoint para executar autenticação e autorização. É usado para <a>autenticação</a> OpenID Connect.',
  /** UNTRANSLATED */
  show_endpoint_details: 'Show endpoint details',
  /** UNTRANSLATED */
  hide_endpoint_details: 'Hide endpoint details',
  logto_endpoint: 'Endpoint do Logto',
  application_id: 'ID do aplicativo',
  application_id_tip:
    'O identificador exclusivo do aplicativo normalmente gerado pela Logto. Também é conhecido como “<a>client_id</a>” em OpenID Connect.',
  application_secret: 'Segredo do aplicativo',
  redirect_uri: 'URI de redirecionamento',
  redirect_uris: 'URIs de redirecionamento',
  redirect_uri_placeholder: 'https://seusite.com.br/app',
  redirect_uri_placeholder_native: 'io.logto://retorno',
  redirect_uri_tip:
    'O URI é redirecionado após o login do usuário (seja bem-sucedido ou não). Consulte OpenID Connect <a>AuthRequest</a> para obter mais informações.',
  post_sign_out_redirect_uri: 'URI de redirecionamento após saída',
  post_sign_out_redirect_uris: 'URIs de redirecionamento após saída',
  post_sign_out_redirect_uri_placeholder: 'https://seusite.com.br/home',
  post_sign_out_redirect_uri_tip:
    'O URI é redirecionado após a saída do usuário (opcional). Pode não ter efeito prático em alguns tipos de aplicativos.',
  cors_allowed_origins: 'Origens permitidas pelo CORS',
  cors_allowed_origins_placeholder: 'https://seusite.com.br',
  cors_allowed_origins_tip:
    'Por padrão, todas as origens de URIs de redirecionamento serão permitidas. Normalmente, nenhuma ação é necessária para este campo. Confira o <a>doc MDN</a> para informações detalhadas.',
  token_endpoint: 'Token Endpoint',
  user_info_endpoint: 'Userinfo Endpoint',
  enable_admin_access: 'Ativar acesso de administrador',
  enable_admin_access_label:
    'Ative ou desative o acesso à API de gerenciamento. Uma vez ativado, você pode usar tokens de acesso para chamar a API de gerenciamento em nome deste aplicativo.',
  always_issue_refresh_token: 'Emitir sempre o token de refresh',
  always_issue_refresh_token_label:
    'Ativar esta configuração permitirá que a Logto emita sempre tokens de Refresh, independentemente de "prompt=consent" ser apresentado na solicitação de autenticação. No entanto, essa prática é desencorajada, a menos que seja necessária, pois não é compatível com o OpenID Connect e pode potencialmente causar problemas.',
  refresh_token_ttl: 'Tempo de vida do Refresh Token em dias',
  refresh_token_ttl_tip:
    'A duração para a qual um Refresh Token pode ser usado para solicitar novos tokens de acesso antes que expire e se torne inválido. As solicitações de token estenderão o TTL do Refresh Token para este valor.',
  rotate_refresh_token: 'Rotacionar Refresh Token',
  rotate_refresh_token_label:
    'Quando ativado, a Logto emitirá um novo Refresh Token para solicitações de token quando 70% do tempo de vida original (TTL) tenha passado ou certas condições sejam atendidas. <a>Saiba mais</a>',
  delete_description:
    'Essa ação não pode ser desfeita. Isso excluirá permanentemente o aplicativo. Insira o nome do aplicativo <span>{{name}}</span> para confirmar.',
  enter_your_application_name: 'Digite o nome do seu aplicativo',
  application_deleted: 'O aplicativo {{name}} foi excluído com sucesso',
  redirect_uri_required: 'Você deve inserir pelo menos um URI de redirecionamento',
  branding: {
    /** UNTRANSLATED */
    name: 'Branding',
    /** UNTRANSLATED */
    description: "Customize your application's display name and logo on the consent screen.",
    /** UNTRANSLATED */
    more_info: 'More info',
    /** UNTRANSLATED */
    more_info_description: 'Offer users more details about your application on the consent screen.',
    /** UNTRANSLATED */
    display_name: 'Display name',
    /** UNTRANSLATED */
    display_logo: 'Display logo',
    /** UNTRANSLATED */
    display_logo_dark: 'Display logo (dark)',
    /** UNTRANSLATED */
    terms_of_use_url: 'Application terms of use URL',
    /** UNTRANSLATED */
    privacy_policy_url: 'Application privacy policy URL',
  },
  permissions: {
    /** UNTRANSLATED */
    name: 'Permissions',
    /** UNTRANSLATED */
    description:
      'Select the permissions that the third-party application requires for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_permissions: 'Personal user information',
    /** UNTRANSLATED */
    organization_permissions: 'Organization access',
    /** UNTRANSLATED */
    table_name: 'Grant permissions',
    /** UNTRANSLATED */
    field_name: 'permission',
    /** UNTRANSLATED */
    delete_text: 'Remove permission',
    /** UNTRANSLATED */
    permission_delete_confirm:
      'This action will withdraw the permissions granted to the third-party app, preventing it from requesting user authorization for specific data types. Are you sure you want to continue?',
  },
  roles: {
    name_column: 'Função',
    description_column: 'Descrição',
    assign_button: 'Atribuir funções',
    delete_description:
      'Esta ação removerá esta função deste aplicativo máquina-a-máquina. A função ainda existirá, mas não será mais associada a este aplicativo máquina-a-máquina.',
    deleted: '{{name}} foi removido com sucesso deste usuário.',
    assign_title: 'Atribuir funções a {{name}}',
    assign_subtitle: 'Autorizar {{name}} uma ou mais funções',
    assign_role_field: 'Atribuir funções',
    role_search_placeholder: 'Pesquisar pelo nome da função',
    added_text: '{{value, number}} adicionados',
    assigned_app_count: '{{value, number}} aplicativos',
    confirm_assign: 'Atribuir funções',
    role_assigned: 'Função(s) atribuída(s) com sucesso',
    search: 'Pesquisar pelo nome, descrição ou ID da função',
    empty: 'Nenhuma função disponível',
  },
};

export default Object.freeze(application_details);
