const application_details = {
  page_title: 'Detalhes da aplicação',
  back_to_applications: 'Voltar para aplicações',
  check_guide: 'Guia de verificação',
  settings: 'Definições',
  settings_description:
    'Uma aplicação é um software ou serviço registado que pode aceder às informações do utilizador ou agir em seu nome. As aplicações ajudam o Logto a identificar quem está a pedir o quê e tratam do início de sessão e das permissões. Preencha os campos obrigatórios para a autenticação.',
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
  machine_logs: 'Registos da máquina',
  application_name: 'Nome da aplicação',
  application_name_placeholder: 'Ex: Site da Empresa',
  description: 'Descrição',
  description_placeholder: 'Insira a descrição da sua aplicação',
  config_endpoint: 'Endpoint de configuração do Provedor de ID Aberto',
  issuer_endpoint: 'Endpoint do emissor',
  jwks_uri: 'URI do JWKS',
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
  application_secret_other: 'Segredos da aplicação',
  redirect_uri: 'URI de redirecionamento',
  redirect_uris: 'URIs de redirecionamento',
  redirect_uri_placeholder: 'https://seusite.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'O URI para redirecionar após o início de sessão de um utilizador (com sucesso ou insucesso). Consulte a <a>AuthRequest</a> do OpenID Connect para obter mais informações.',
  mixed_redirect_uri_warning:
    'O tipo de aplicação não é compatível com pelo menos um dos URIs de redirecionamento. Isso não segue as melhores práticas e recomendamos fortemente manter os URIs de redirecionamento consistentes.',
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
  rotate_refresh_token_label_for_public_clients:
    'Quando ativado, o Logto emitirá um novo token de atualização para cada solicitação de token. <a>Saiba mais</a>',
  backchannel_logout: 'Logout de backchannel',
  backchannel_logout_description:
    'Configure o endpoint de logout de backchannel do OpenID Connect e se a sessão é necessária para esta aplicação.',
  backchannel_logout_uri: 'URI de logout de backchannel',
  backchannel_logout_uri_session_required: 'A sessão é necessária?',
  backchannel_logout_uri_session_required_description:
    'Quando ativado, o RP exige que uma reivindicação `sid` (ID da sessão) seja incluída no token de logout para identificar a sessão do RP com o OP quando o `backchannel_logout_uri` é utilizado.',
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
    'Redirecione o seu botão de autenticação usando as rotas especificadas. Nota: Estas rotas são insubstituíveis.',
  protect_origin_server: 'Proteja o seu servidor de origem',
  protect_origin_server_description:
    'Assegure-se de proteger o seu servidor de origem do acesso direto. Consulte o guia para mais <a>instruções detalhadas</a>.',
  third_party_settings_description:
    'Integre aplicações de terceiros com a Logto como seu Provedor de Identidade (IdP) usando OIDC / OAuth 2.0, apresentando uma tela de consentimento para autorização do utilizador.',
  session_duration: 'Duração da sessão (dias)',
  try_it: 'Experimente',
  no_organization_placeholder: 'Nenhuma organização encontrada. <a>Ir para organizações</a>',
  field_custom_data: 'Dados personalizados',
  field_custom_data_tip:
    'Informações personalizadas adicionais da aplicação não listadas nas propriedades predefinidas da aplicação, como configurações e configurações específicas de negócios.',
  custom_data_invalid: 'Os dados personalizados devem ser um objeto JSON válido',
  branding: {
    name: 'Marca',
    description: 'Personalize o nome e o logótipo da sua aplicação no ecrã de consentimento.',
    description_third_party:
      'Personalize o nome e o logotipo da aplicação no ecrã de consentimento.',
    app_logo: 'Logótipo da aplicação',
    app_level_sie: 'Experiência de início de sessão ao nível da aplicação',
    app_level_sie_switch:
      'Ative a experiência de início de sessão ao nível da aplicação e configure a personalização da marca específica da aplicação. Se desativado, será utilizada a experiência de início de sessão omni.',
    more_info: 'Mais informações',
    more_info_description:
      'Ofereça aos utilizadores mais detalhes sobre a sua aplicação no ecrã de consentimento.',
    display_name: 'Nome a apresentar',
    application_logo: 'Logótipo da aplicação',
    application_logo_dark: 'Logótipo da aplicação (escuro)',
    brand_color: 'Cor da marca',
    brand_color_dark: 'Cor da marca (escura)',
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
    oidc_title: 'OIDC',
    oidc_description:
      'As permissões principais de OIDC são configuradas automaticamente para a sua aplicação. Estes escopos são essenciais para autenticação e não são apresentados no ecrã de consentimento do utilizador.',
    default_oidc_permissions: 'Permissões OIDC predefinidas',
    permission_column: 'Permissão',
    guide_column: 'Guia',
    openid_permission: 'openid',
    openid_permission_guide:
      "Opcional para acesso a recursos OAuth.\nObrigatório para autenticação OIDC. Concede acesso a um token de ID e permite acesso ao 'userinfo_endpoint'.",
    offline_access_permission: 'offline_access',
    offline_access_permission_guide:
      'Opcional. Obtém tokens de atualização para acesso de longa duração ou tarefas em segundo plano.',
  },
  roles: {
    assign_button: 'Atribuir funções de máquina a máquina',
    delete_description:
      'Esta ação irá remover esta função desta aplicação entre máquinas. A função em si ainda existirá, mas não será mais associada a esta aplicação entre as máquinas.',
    deleted: '{{name}} foi removido com sucesso deste utilizador.',
    assign_title: 'Atribuir funções de máquina a máquina a {{name}}',
    assign_subtitle:
      'Aplicações de máquina a máquina devem ter funções do tipo máquina a máquina para aceder a recursos de API relacionados.',
    assign_role_field: 'Atribuir funções de máquina a máquina',
    role_search_placeholder: 'Pesquisar por nome de função',
    added_text: '{{value, number}} adicionado',
    assigned_app_count: '{{value, number}} aplicações',
    confirm_assign: 'Atribuir funções de máquina a máquina',
    role_assigned: 'Função(s) atribuída(s) com sucesso',
    search: 'Pesquisar por nome, descrição ou ID da função',
    empty: 'Nenhuma função disponível',
  },
  secrets: {
    value: 'Valor',
    empty: 'A aplicação não tem segredos.',
    created_at: 'Criado em',
    expires_at: 'Expira em',
    never: 'Nunca',
    create_new_secret: 'Criar novo segredo',
    delete_confirmation:
      'Esta ação não pode ser desfeita. Tem a certeza de que deseja eliminar este segredo?',
    deleted: 'O segredo foi eliminado com sucesso.',
    activated: 'O segredo foi ativado com sucesso.',
    deactivated: 'O segredo foi desativado com sucesso.',
    legacy_secret: 'Segredo legado',
    expired: 'Expirado',
    expired_tooltip: 'Este segredo expirou em {{date}}.',
    create_modal: {
      title: 'Criar segredo da aplicação',
      expiration: 'Expiração',
      expiration_description: 'O segredo expirará em {{date}}.',
      expiration_description_never:
        'O segredo nunca expirará. Recomendamos definir uma data de expiração para melhorar a segurança.',
      days: '{{count}} dia',
      days_other: '{{count}} dias',
      years: '{{count}} ano',
      years_other: '{{count}} anos',
      created: 'O segredo {{name}} foi criado com sucesso.',
    },
    edit_modal: {
      title: 'Editar segredo da aplicação',
      edited: 'O segredo {{name}} foi editado com sucesso.',
    },
  },
  saml_idp_config: {
    title: 'Metadados do IdP SAML',
    description:
      'Use os seguintes metadados e certificado para configurar o IdP SAML na sua aplicação.',
    metadata_url_label: 'URL dos metadados do IdP',
    single_sign_on_service_url_label: 'URL do serviço de logon único',
    idp_entity_id_label: 'ID da entidade IdP',
  },
  saml_idp_certificates: {
    title: 'Certificado de assinatura SAML',
    expires_at: 'Expira em',
    finger_print: 'Impressão digital',
    status: 'Estado',
    active: 'Ativo',
    inactive: 'Inativo',
  },
  saml_idp_name_id_format: {
    title: 'Formato do ID de Nome',
    description: 'Selecione o formato do ID de Nome do IdP SAML.',
    persistent: 'Persistente',
    persistent_description: 'Usar o ID de utilizador do Logto como ID de Nome',
    transient: 'Transitório',
    transient_description: 'Usar um ID de utilizador único como ID de Nome',
    unspecified: 'Não especificado',
    unspecified_description: 'Usar o ID de utilizador do Logto como ID de Nome',
    email_address: 'Endereço de email',
    email_address_description: 'Usar o endereço de email como ID de Nome',
  },
  saml_encryption_config: {
    encrypt_assertion: 'Criptografar asserção SAML',
    encrypt_assertion_description: 'Ao ativar esta opção, a asserção SAML será criptografada.',
    encrypt_then_sign: 'Criptografar e depois assinar',
    encrypt_then_sign_description:
      'Ao ativar esta opção, a asserção SAML será criptografada e depois assinada; caso contrário, a asserção SAML será assinada e depois criptografada.',
    certificate: 'Certificado',
    certificate_tooltip:
      'Copie e cole o certificado x509 que você obtém do seu provedor de serviço para criptografar a asserção SAML.',
    certificate_placeholder:
      '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...\n-----END CERTIFICATE-----\n',
    certificate_missing_error: 'O certificado é obrigatório.',
    certificate_invalid_format_error:
      'Formato de certificado inválido detectado. Por favor, verifique o formato do certificado e tente novamente.',
  },
  saml_app_attribute_mapping: {
    name: 'Mapeamentos de atributos',
    title: 'Mapeamentos de atributos base',
    description:
      'Adicione mapeamentos de atributos para sincronizar o perfil do utilizador do Logto para a sua aplicação.',
    col_logto_claims: 'Valor do Logto',
    col_sp_claims: 'Nome do valor da sua aplicação',
    add_button: 'Adicionar outro',
  },
};

export default Object.freeze(application_details);
