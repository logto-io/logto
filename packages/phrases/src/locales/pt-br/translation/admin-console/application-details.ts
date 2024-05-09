const application_details = {
  page_title: 'Detalhes da aplicação',
  back_to_applications: 'Voltar para Aplicativos',
  check_guide: 'Visualizar o guia',
  settings: 'Configurações',
  /** UNTRANSLATED */
  settings_description:
    'An "Application" is a registered software or service that can access user info or act for a user. Applications help recognize who’s asking for what from Logto and handle the sign-in and permission. Fill in the required fields for authentication.',
  /** UNTRANSLATED */
  integration: 'Integration',
  /** UNTRANSLATED */
  integration_description:
    "Deploy with Logto secure workers, powered by Cloudflare's edge network for top-tier performance and 0ms cold starts worldwide.",
  /** UNTRANSLATED */
  service_configuration: 'Service configuration',
  /** UNTRANSLATED */
  service_configuration_description: 'Complete the necessary configurations in your service.',
  /** UNTRANSLATED */
  session: 'Session',
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
  /** UNTRANSLATED */
  app_domain_description_1:
    'Feel free to use your domain with {{domain}} powered by Logto, which is permanently valid.',
  /** UNTRANSLATED */
  app_domain_description_2:
    'Feel free to utilize your domain <domain>{{domain}}</domain> which is permanently valid.',
  /** UNTRANSLATED */
  custom_rules: 'Custom authentication rules',
  /** UNTRANSLATED */
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  /** UNTRANSLATED */
  custom_rules_description:
    'Set rules with regular expressions for authentication-required routes. Default: full-site protection if left blank.',
  /** UNTRANSLATED */
  authentication_routes: 'Authentication routes',
  /** UNTRANSLATED */
  custom_rules_tip:
    "Here are two case scenarios:<ol><li>To only protect routes '/admin' and '/privacy' with authentication: ^/(admin|privacy)/.*</li><li>To exclude JPG images from authentication: ^(?!.*\\.jpg$).*$</li></ol>",
  /** UNTRANSLATED */
  authentication_routes_description:
    'Redirect your authentication button using the specified routes. Note: These routes are irreplaceable.',
  /** UNTRANSLATED */
  protect_origin_server: 'Protect your origin server',
  /** UNTRANSLATED */
  protect_origin_server_description:
    'Ensure to protect your origin server from direct access. Refer to the guide for more <a>detailed instructions</a>.',
  /** UNTRANSLATED */
  session_duration: 'Session duration (days)',
  /** UNTRANSLATED */
  try_it: 'Try it',
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
    user_permissions: 'Personal user data',
    /** UNTRANSLATED */
    organization_permissions: 'Organization access',
    /** UNTRANSLATED */
    table_name: 'Grant permissions',
    /** UNTRANSLATED */
    field_name: 'Permission',
    /** UNTRANSLATED */
    field_description: 'Displayed in the consent screen',
    /** UNTRANSLATED */
    delete_text: 'Remove permission',
    /** UNTRANSLATED */
    permission_delete_confirm:
      'This action will withdraw the permissions granted to the third-party app, preventing it from requesting user authorization for specific data types. Are you sure you want to continue?',
    /** UNTRANSLATED */
    permissions_assignment_description:
      'Select the permissions the third-party application requests for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_profile: 'User data',
    /** UNTRANSLATED */
    api_permissions: 'API permissions',
    /** UNTRANSLATED */
    organization: 'Organization permissions',
    /** UNTRANSLATED */
    user_permissions_assignment_form_title: 'Add the user profile permissions',
    /** UNTRANSLATED */
    organization_permissions_assignment_form_title: 'Add the organization permissions',
    /** UNTRANSLATED */
    api_resource_permissions_assignment_form_title: 'Add the API resource permissions',
    /** UNTRANSLATED */
    user_data_permission_description_tips:
      'You can modify the description of the personal user data permissions via "Sign-in Experience > Content > Manage Language"',
    /** UNTRANSLATED */
    permission_description_tips:
      'When Logto is used as an Identity Provider (IdP) for authentication in third-party apps, and users are asked for authorization, this description appears on the consent screen.',
    /** UNTRANSLATED */
    user_title: 'User',
    /** UNTRANSLATED */
    user_description:
      'Select the permissions requested by the third-party app for accessing specific user data.',
    /** UNTRANSLATED */
    grant_user_level_permissions: 'Grant permissions of user data',
    /** UNTRANSLATED */
    organization_title: 'Organization',
    /** UNTRANSLATED */
    organization_description:
      'Select the permissions requested by the third-party app for accessing specific organization data.',
    /** UNTRANSLATED */
    grant_organization_level_permissions: 'Grant permissions of organization data',
    /** UNTRANSLATED */
    add_permissions_for_organization:
      'Add the API resource permissions used in the "Organization template"',
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
