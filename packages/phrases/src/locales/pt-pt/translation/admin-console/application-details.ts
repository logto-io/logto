const application_details = {
  page_title: 'Detalhes da aplicação',
  back_to_applications: 'Voltar para aplicações',
  check_guide: 'Guia de verificação',
  settings: 'Definições',
  settings_description:
    'Uma "Aplicação" é um software ou serviço registado que pode aceder às informações do utilizador ou agir em nome de um utilizador. As aplicações ajudam a reconhecer quem está a pedir o quê à Logto e a gerir o início de sessão e as permissões. Preencha os campos obrigatórios para autenticação.',
  integration: 'Integração',
  integration_description:
    'Implemente com os trabalhadores seguros da Logto, alimentados pela rede de borda da Cloudflare para um desempenho de primeira classe e inícios instantâneos a 0ms em todo o mundo.',
  service_configuration: 'Configuração do serviço',
  service_configuration_description: 'Complete as configurações necessárias no seu serviço.',
  session: 'Sessão',
  endpoints_and_credentials: 'Endpoints & Credenciais',
  endpoints_and_credentials_description:
    'Utilize os seguintes endpoints e credenciais para configurar a ligação OIDC na sua aplicação.',
  refresh_token_settings: 'Token de atualização',
  refresh_token_settings_description:
    'Gerir as regras de token de atualização para esta aplicação.',
  application_roles: 'Funções da aplicação',
  machine_logs: 'Registos da máquina',
  application_name: 'Nome da aplicação',
  application_name_placeholder: 'Ex: Site da Empresa',
  description: 'Descrição',
  description_placeholder: 'Insira a descrição da sua aplicação',
  config_endpoint: 'Endpoint de configuração do Provedor de ID Aberto',
  authorization_endpoint: 'Endpoint de autorização',
  authorization_endpoint_tip:
    'O endpoint para realizar a autenticação e autorização. É usado para <a>autenticação</a> OpenID Connect.',
  show_endpoint_details: 'Mostrar detalhes do endpoint',
  hide_endpoint_details: 'Ocultar detalhes do endpoint',
  logto_endpoint: 'Endpoint Logto',
  application_id: 'ID da aplicação',
  application_id_tip:
    'O identificador exclusivo da aplicação normalmente gerado pelo Logto. Também representa “<a>client_id</a>” no OpenID Connect.',
  application_secret: 'Segredo da aplicação',
  redirect_uri: 'URI de redirecionamento',
  redirect_uris: 'URIs de redirecionamento',
  redirect_uri_placeholder: 'https://seusite.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'O URI para redirecionar após o início de sessão de um utilizador (com sucesso ou insucesso). Consulte a <a>AuthRequest</a> do OpenID Connect para obter mais informações.',
  post_sign_out_redirect_uri: 'URI de redirecionamento pós-saída',
  post_sign_out_redirect_uris: 'URIs de redirecionamento pós-saída',
  post_sign_out_redirect_uri_placeholder: 'https://seusite.com/home',
  post_sign_out_redirect_uri_tip:
    'O URI para redirecionar após a saída de um utilizador (opcional). Pode não ter efeito prático em alguns tipos de aplicações.',
  cors_allowed_origins: 'Origens permitidas pelo CORS',
  cors_allowed_origins_placeholder: 'https://seusite.com',
  cors_allowed_origins_tip:
    'Por padrão, todas as origens de redirecionamento são permitidas. Recomenda-se restringi-las. Consulte a <a>documentação MDN</a> para obter informações detalhadas.',
  token_endpoint: 'Endpoint do token',
  user_info_endpoint: 'Endpoint do Utilizador',
  enable_admin_access: 'Ativar o acesso de administrador',
  enable_admin_access_label:
    'Ativar ou desativar o acesso à API de gestão. Uma vez ativado, pode utilizar tokens de acesso para chamar a API de gestão em nome desta aplicação.',
  always_issue_refresh_token: 'Sempre emitir token de atualização',
  always_issue_refresh_token_label:
    'Ao ativar essa configuração, a Logto sempre emitirá tokens de atualização, independentemente de `prompt = consent` ser apresentado na solicitação de autenticação. No entanto, essa prática é desencorajada, a menos que seja necessária, pois não é compatível com OpenID Connect e pode causar problemas.',
  refresh_token_ttl: 'Tempo de vida do token de atualização em dias',
  refresh_token_ttl_tip:
    'O tempo pelo qual um token de atualização pode ser usado para solicitar novos tokens de acesso antes de expirar e se tornar inválido. As solicitações de token estenderão o TTL do token de atualização para esse valor.',
  rotate_refresh_token: 'Rotacionar o token de atualização',
  rotate_refresh_token_label:
    'Quando ativado, o Logto emitirá um novo token de atualização para solicitações de token quando 70% do tempo de vida original (TTL) tiver passado ou certas condições forem atendidas. <a>Saiba mais</a>',
  delete_description:
    'Esta ação não pode ser revertida. Esta ação irá eliminar permanentemente a aplicação. Insira o nome da aplicação <span>{{name}}</span> para confirmar.',
  enter_your_application_name: 'Insira o nome da aplicação',
  application_deleted: 'Aplicação {{name}} eliminada com sucesso',
  redirect_uri_required: 'Deve inserir pelo menos um URI de redirecionamento',
  app_domain_description_1:
    'Sinta-se à vontade para utilizar o seu domínio com {{domain}} alimentado pela Logto, que é permanentemente válido.',
  app_domain_description_2:
    'Sinta-se à vontade para utilizar o seu domínio <domain>{{domain}}</domain> que é permanentemente válido.',
  custom_rules: 'Regras de autenticação personalizadas',
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  custom_rules_description:
    'Defina regras com expressões regulares para rotas que requerem autenticação. Padrão: proteção de todo o site se ficar em branco.',
  authentication_routes: 'Rotas de autenticação',
  custom_rules_tip:
    "Aqui estão dois cenários possíveis:<ol><li>Para proteger apenas as rotas '/admin' e '/privacy' com autenticação: ^/(admin|privacy)/.*</li><li>Para excluir imagens JPG da autenticação: ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    'Redirecione o seu botão de autenticação usando as rotas especificadas. Nota: Estas rotas são irsubstituíveis.',
  protect_origin_server: 'Proteja o seu servidor de origem',
  protect_origin_server_description:
    'Assegure-se de proteger o seu servidor de origem do acesso direto. Consulte o guia para mais <a>instruções detalhadas</a>.',
  session_duration: 'Duração da sessão (dias)',
  try_it: 'Experimente',
  branding: {
    name: 'Marca',
    description: 'Personalize o nome e o logótipo da sua aplicação no ecrã de consentimento.',
    more_info: 'Mais informações',
    more_info_description:
      'Ofereça aos utilizadores mais detalhes sobre a sua aplicação no ecrã de consentimento.',
    display_name: 'Nome a apresentar',
    display_logo: 'Logótipo a apresentar',
    display_logo_dark: 'Logótipo a apresentar (escuro)',
    terms_of_use_url: 'URL dos termos de utilização da aplicação',
    privacy_policy_url: 'URL da política de privacidade da aplicação',
  },
  permissions: {
    name: 'Permissões',
    description:
      'Selecione as permissões que a aplicação de terceiros requer para a autorização do utilizador para aceder a tipos específicos de dados.',
    user_permissions: 'Dados pessoais do utilizador',
    organization_permissions: 'Acesso à organização',
    table_name: 'Conceder permissões',
    field_name: 'Permissão',
    field_description: 'Mostrado no ecrã de consentimento',
    delete_text: 'Remover permissão',
    permission_delete_confirm:
      'Esta ação irá retirar as permissões concedidas à aplicação de terceiros, impedindo-a de solicitar a autorização do utilizador para tipos específicos de dados. Tem a certeza de que deseja continuar?',
    permissions_assignment_description:
      'Selecione as permissões que a aplicação de terceiros solicita para a autorização do utilizador para aceder a tipos específicos de dados.',
    user_profile: 'Dados do utilizador',
    api_permissions: 'Permissões de API',
    organization: 'Permissões da organização',
    user_permissions_assignment_form_title: 'Adicionar permissões de perfil de utilizador',
    organization_permissions_assignment_form_title: 'Adicionar permissões da organização',
    api_resource_permissions_assignment_form_title: 'Adicionar permissões de recurso da API',
    user_data_permission_description_tips:
      'Pode modificar a descrição das permissões de dados pessoais do utilizador através de "Experiência de Início de Sessão > Conteúdo > Gerir Idioma"',
    permission_description_tips:
      'Quando o Logto é usado como um Prestador de Identidades (IdP) para autenticação em aplicações de terceiros, e os utilizadores são solicitados para autorização, esta descrição aparece no ecrã de consentimento.',
    user_title: 'Utilizador',
    user_description:
      'Selecione as permissões solicitadas pela aplicação de terceiros para aceder a dados específicos do utilizador.',
    grant_user_level_permissions: 'Conceder permissões de dados do utilizador',
    organization_title: 'Organização',
    organization_description:
      'Selecione as permissões solicitadas pela aplicação de terceiros para aceder a dados específicos da organização.',
    grant_organization_level_permissions: 'Conceder permissões de dados da organização',
  },
  roles: {
    name_column: 'Nome da função',
    description_column: 'Descrição',
    assign_button: 'Atribuir funções',
    delete_description:
      'Esta ação irá remover esta função desta aplicação entre máquinas. A função em si ainda existirá, mas não será mais associada a esta aplicação entre as máquinas.',
    deleted: '{{name}} foi removido com sucesso deste utilizador.',
    assign_title: 'Atribuir funções a {{name}}',
    assign_subtitle: 'Autorizar {{name}} uma ou mais funções',
    assign_role_field: 'Atribuir funções',
    role_search_placeholder: 'Pesquisar por nome de função',
    added_text: '{{value, number}} adicionado',
    assigned_app_count: '{{value, number}} aplicações',
    confirm_assign: 'Atribuir funções',
    role_assigned: 'Função(s) atribuída(s) com sucesso',
    search: 'Pesquisar por nome, descrição ou ID da função',
    empty: 'Nenhuma função disponível',
  },
};

export default Object.freeze(application_details);
