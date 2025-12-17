const application_details = {
  page_title: 'Detalhes da aplicação',
  back_to_applications: 'Voltar para Aplicativos',
  check_guide: 'Visualizar o guia',
  settings: 'Configurações',
  settings_description:
    'Uma aplicação é um software ou serviço registrado que pode acessar informações do usuário ou atuar em seu nome. As aplicações ajudam o Logto a identificar quem está solicitando o quê e cuidam do acesso e das permissões. Preencha os campos obrigatórios para a autenticação.',
  integration: 'Integração',
  integration_description:
    'Implemente com trabalhadores seguros do Logto, alimentados pela rede de borda da Cloudflare para desempenho de primeira linha e inicializações instantâneas de 0ms em todo o mundo.',
  service_configuration: 'Configuração de serviço',
  service_configuration_description: 'Conclua as configurações necessárias em seu serviço.',
  session: 'Sessão',
  endpoints_and_credentials: 'Endpoints e Credenciais',
  endpoints_and_credentials_description:
    'Use os seguintes endpoints e credenciais para configurar a conexão OIDC em sua aplicação.',
  refresh_token_settings: 'Token de atualização',
  refresh_token_settings_description:
    'Gerencie as regras do token de atualização para esta aplicação.',
  machine_logs: 'Logs da máquina',
  application_name: 'Nome do aplicativo',
  application_name_placeholder: 'Meu aplicativo',
  description: 'Descrição',
  description_placeholder: 'Digite a descrição do seu aplicativo',
  config_endpoint: 'Endpoint de configuração do OpenID Provider',
  issuer_endpoint: 'Endpoint do emissor',
  jwks_uri: 'JWKS URI',
  authorization_endpoint: 'Endpoint de autorização',
  authorization_endpoint_tip:
    'O endpoint para execução de autenticação e autorização. É usado para <a>autenticação</a> OpenID Connect.',
  show_endpoint_details: 'Mostrar detalhes do endpoint',
  hide_endpoint_details: 'Ocultar detalhes do endpoint',
  logto_endpoint: 'Endpoint do Logto',
  application_id: 'ID da aplicação',
  application_id_tip:
    'O identificador exclusivo da aplicação normalmente gerado pelo Logto. Também conhecido como “<a>client_id</a>” no OpenID Connect.',
  application_secret: 'Segredo da aplicação',
  application_secret_other: 'Segredos do aplicativo',
  redirect_uri: 'URI de redirecionamento',
  redirect_uris: 'URIs de redirecionamento',
  redirect_uri_placeholder: 'https://seusite.com.br/app',
  redirect_uri_placeholder_native: 'io.logto://retorno',
  redirect_uri_tip:
    'O URI para o redirecionamento após o login do usuário (seja bem-sucedido ou não). Consulte <a>AuthRequest</a> OpenID Connect para mais informações.',
  mixed_redirect_uri_warning:
    'O tipo de sua aplicação não é compatível com pelo menos um dos URIs de redirecionamento. Isso não segue as melhores práticas, e recomendamos fortemente manter os URIs de redirecionamento consistentes.',
  post_sign_out_redirect_uri: 'URI de redirecionamento após saída',
  post_sign_out_redirect_uris: 'URIs de redirecionamento após saída',
  post_sign_out_redirect_uri_placeholder: 'https://seusite.com.br/home',
  post_sign_out_redirect_uri_tip:
    'O URI para redirecionamento após o usuário sair (opcional). Pode não ter efeito prático em alguns tipos de aplicativos.',
  cors_allowed_origins: 'Origens permitidas pelo CORS',
  cors_allowed_origins_placeholder: 'https://seusite.com.br',
  cors_allowed_origins_tip:
    'Por padrão, todas as origens dos URIs de redirecionamento serão permitidas. Normalmente, nenhuma ação é necessária para este campo. Confira a <a>documentação MDN</a> para informações detalhadas.',
  token_endpoint: 'Token Endpoint',
  user_info_endpoint: 'Userinfo Endpoint',
  enable_admin_access: 'Ativar acesso de administrador',
  enable_admin_access_label:
    'Ative ou desative o acesso à API de gerenciamento. Uma vez ativado, você pode usar tokens de acesso para chamar a API de gerenciamento em nome deste aplicativo.',
  always_issue_refresh_token: 'Emitir sempre o token de atualização',
  always_issue_refresh_token_label:
    'Ativar esta configuração permitirá que o Logto emita sempre tokens de atualização, independentemente de "prompt=consent" ser apresentado na solicitação de autenticação. No entanto, essa prática é desencorajada, a menos que seja necessária, pois não é compatível com o OpenID Connect e pode potencialmente causar problemas.',
  refresh_token_ttl: 'Tempo de vida do token de atualização em dias',
  refresh_token_ttl_tip:
    'A duração para a qual um token de atualização pode ser usado para solicitar novos tokens de acesso antes de expirar e se tornar inválido. As solicitações de token estenderão o TTL do token de atualização para este valor.',
  rotate_refresh_token: 'Rotacionar token de atualização',
  rotate_refresh_token_label:
    'Quando ativado, o Logto emitirá um novo token de atualização para solicitações de token quando 70% do tempo de vida original (TTL) tiver passado ou certas condições forem atendidas. <a>Saiba mais</a>',
  rotate_refresh_token_label_for_public_clients:
    'Quando ativado, o Logto emitirá um novo token de atualização para cada solicitação de token. <a>Saiba mais</a>',
  backchannel_logout: 'Logout por backchannel',
  backchannel_logout_description:
    'Configure o endpoint de logout do backchannel OpenID Connect e se a sessão é necessária para esta aplicação.',
  backchannel_logout_uri: 'URI de logout por backchannel',
  backchannel_logout_uri_session_required: 'A sessão é necessária?',
  backchannel_logout_uri_session_required_description:
    'Quando ativado, o RP exige que uma reivindicação `sid` (ID da sessão) seja incluída no token de logout para identificar a sessão do RP com o OP quando o `backchannel_logout_uri` é usado.',
  delete_description:
    'Esta ação não pode ser desfeita. Isso excluirá permanentemente o aplicativo. Insira o nome do aplicativo <span>{{name}}</span> para confirmar.',
  enter_your_application_name: 'Digite o nome do seu aplicativo',
  application_deleted: 'O aplicativo {{name}} foi excluído com sucesso',
  redirect_uri_required: 'Você deve inserir pelo menos um URI de redirecionamento',
  app_domain_description_1:
    'Sinta-se à vontade para usar seu domínio com {{domain}} alimentado pelo Logto, que é permanentemente válido.',
  app_domain_description_2:
    'Sinta-se à vontade para utilizar seu domínio <domain>{{domain}}</domain> que é permanentemente válido.',
  custom_rules: 'Regras de autenticação personalizadas',
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  custom_rules_description:
    'Defina regras com expressões regulares para rotas que requerem autenticação. Padrão: proteção de todo o site se deixado em branco.',
  authentication_routes: 'Rotas de autenticação',
  custom_rules_tip:
    "Aqui estão dois cenários de exemplo:<ol><li>Para proteger apenas as rotas '/admin' e '/privacy' com autenticação: ^/(admin|privacy)/.*</li><li>Para excluir imagens JPG da autenticação: ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    'Redirecione seu botão de autenticação usando as rotas especificadas. Observação: Essas rotas são irsubstituíveis.',
  protect_origin_server: 'Proteger seu servidor de origem',
  protect_origin_server_description:
    'Garanta proteger seu servidor de origem contra acesso direto. Consulte o guia para mais <a>instruções detalhadas</a>.',
  third_party_settings_description:
    'Integre aplicativos de terceiros com o Logto como seu Provedor de Identidade (IdP) usando OIDC/OAuth 2.0, apresentando uma tela de consentimento para autorização do usuário.',
  session_duration: 'Duração da sessão (dias)',
  try_it: 'Tente',
  no_organization_placeholder: 'Nenhuma organização encontrada. <a>Vá para organizações</a>',
  field_custom_data: 'Dados personalizados',
  field_custom_data_tip:
    'Informações adicionais personalizadas da aplicação não listadas nas propriedades pré-definidas da aplicação, como configurações e configurações específicas dos negócios.',
  custom_data_invalid: 'Os dados personalizados devem ser um objeto JSON válido',
  branding: {
    name: 'Branding',
    description:
      'Personalize o nome e logotipo da exibição de sua aplicação na tela de consentimento.',
    description_third_party:
      'Personalize o nome e logotipo da exibição da sua aplicação na tela de consentimento.',
    app_logo: 'Logo do aplicativo',
    app_level_sie: 'Experiência de login ao nível do aplicativo',
    app_level_sie_switch:
      'Ative a experiência de login ao nível do aplicativo e configure o branding específico do aplicativo. Se desativado, a experiência de login omnicanal será usada.',
    more_info: 'Mais informações',
    more_info_description:
      'Ofereça aos usuários mais detalhes sobre sua aplicação na tela de consentimento.',
    display_name: 'Nome de exibição',
    application_logo: 'Logo da aplicação',
    application_logo_dark: 'Logo da aplicação (escuro)',
    brand_color: 'Cor da marca',
    brand_color_dark: 'Cor da marca (escuro)',
    terms_of_use_url: 'URL dos termos de uso da aplicação',
    privacy_policy_url: 'URL da política de privacidade da aplicação',
  },
  permissions: {
    name: 'Permissões',
    description:
      'Selecione as permissões que o aplicativo de terceiros requer para autorização do usuário para acessar tipos específicos de dados.',
    user_permissions: 'Dados pessoais do usuário',
    organization_permissions: 'Acesso à organização',
    table_name: 'Conceder permissões',
    field_name: 'Permissão',
    field_description: 'Exibido na tela de consentimento',
    delete_text: 'Remover permissão',
    permission_delete_confirm:
      'Esta ação retirará as permissões concedidas ao aplicativo de terceiros, impedindo-o de solicitar autorização do usuário para tipos específicos de dados. Tem certeza de que deseja continuar?',
    permissions_assignment_description:
      'Selecione as permissões solicitadas pelo aplicativo de terceiros para autorização do usuário para acessar tipos específicos de dados.',
    user_profile: 'Dados do usuário',
    api_permissions: 'Permissões de API',
    organization: 'Permissões da organização',
    user_permissions_assignment_form_title: 'Adicionar as permissões do perfil do usuário',
    organization_permissions_assignment_form_title: 'Adicionar as permissões da organização',
    api_resource_permissions_assignment_form_title: 'Adicionar as permissões de recursos da API',
    user_data_permission_description_tips:
      'Você pode modificar a descrição das permissões de dados pessoais do usuário via "Experiência de Login > Conteúdo > Gerenciar Idioma"',
    permission_description_tips:
      'Quando o Logto é usado como Provedor de Identidade (IdP) para autenticação em aplicativos de terceiros, e os usuários são solicitados para autorização, esta descrição aparece na tela de consentimento.',
    user_title: 'Usuário',
    user_description:
      'Selecione as permissões solicitadas pelo aplicativo de terceiros para acessar tipos específicos de dados do usuário.',
    grant_user_level_permissions: 'Conceder permissões de dados de usuário',
    organization_title: 'Organização',
    organization_description:
      'Selecione as permissões solicitadas pelo aplicativo de terceiros para acessar tipos específicos de dados da organização.',
    grant_organization_level_permissions: 'Conceder permissões de dados da organização',
    oidc_title: 'OIDC',
    oidc_description:
      'As permissões principais do OIDC são configuradas automaticamente para seu app. Esses escopos são essenciais para autenticação e não são exibidos na tela de consentimento do usuário.',
    default_oidc_permissions: 'Permissões OIDC padrão',
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
    assign_button: 'Atribuir funções de máquina para máquina',
    delete_description:
      'Esta ação removerá esta função deste aplicativo máquina-a-máquina. A função ainda existirá, mas não será mais associada a este aplicativo máquina-a-máquina.',
    deleted: '{{name}} foi removido com sucesso deste usuário.',
    assign_title: 'Atribuir funções de máquina para máquina a {{name}}',
    assign_subtitle:
      'Aplicativos máquina-a-máquina devem ter tipos de funções máquina-a-máquina para acessar recursos de API relacionados.',
    assign_role_field: 'Atribuir funções de máquina para máquina',
    role_search_placeholder: 'Pesquisar pelo nome da função',
    added_text: '{{value, number}} adicionados',
    assigned_app_count: '{{value, number}} aplicativos',
    confirm_assign: 'Atribuir funções de máquina para máquina',
    role_assigned: 'Função(s) atribuída(s) com sucesso',
    search: 'Pesquisar pelo nome, descrição ou ID da função',
    empty: 'Nenhuma função disponível',
  },
  secrets: {
    value: 'Valor',
    empty: 'O aplicativo não possui nenhum segredo.',
    created_at: 'Criado em',
    expires_at: 'Expira em',
    never: 'Nunca',
    create_new_secret: 'Criar novo segredo',
    delete_confirmation:
      'Esta ação não pode ser desfeita. Tem certeza de que deseja excluir este segredo?',
    deleted: 'O segredo foi excluído com sucesso.',
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
        'O segredo nunca expirará. Recomendamos definir uma data de expiração para maior segurança.',
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
    title: 'Metadados SAML IdP',
    description:
      'Use os seguintes metadados e certificado para configurar o IdP SAML em sua aplicação.',
    metadata_url_label: 'URL de metadados IdP',
    single_sign_on_service_url_label: 'URL do serviço de logon único',
    idp_entity_id_label: 'ID da entidade IdP',
  },
  saml_idp_certificates: {
    title: 'Certificado de assinatura SAML',
    expires_at: 'Expira em',
    finger_print: 'Impressão digital',
    status: 'Status',
    active: 'Ativo',
    inactive: 'Inativo',
  },
  saml_idp_name_id_format: {
    title: 'Formato Name ID',
    description: 'Selecione o formato de Name ID do IdP SAML.',
    persistent: 'Persistente',
    persistent_description: 'Use o ID do usuário Logto como Name ID',
    transient: 'Transiente',
    transient_description: 'Use um ID de usuário único como Name ID',
    unspecified: 'Não especificado',
    unspecified_description: 'Use o ID do usuário Logto como Name ID',
    email_address: 'Endereço de e-mail',
    email_address_description: 'Use o endereço de e-mail como Name ID',
  },
  saml_encryption_config: {
    encrypt_assertion: 'Criptografar asserção SAML',
    encrypt_assertion_description: 'Ao habilitar esta opção, a asserção SAML será criptografada.',
    encrypt_then_sign: 'Criptografar e depois assinar',
    encrypt_then_sign_description:
      'Ao habilitar esta opção, a asserção SAML será criptografada e depois assinada; caso contrário, a asserção SAML será assinada e depois criptografada.',
    certificate: 'Certificado',
    certificate_tooltip:
      'Copie e cole o certificado x509 que você obteve do seu provedor de serviços para criptografar a asserção SAML.',
    certificate_placeholder:
      '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...\n-----END CERTIFICATE-----\n',
    certificate_missing_error: 'O certificado é obrigatório.',
    certificate_invalid_format_error:
      'Formato de certificado inválido detectado. Verifique o formato do certificado e tente novamente.',
  },
  saml_app_attribute_mapping: {
    name: 'Mapeamento de atributos',
    title: 'Mapeamento de atributos básicos',
    description:
      'Adicione mapeamentos de atributos para sincronizar o perfil do usuário do Logto para sua aplicação.',
    col_logto_claims: 'Valor do Logto',
    col_sp_claims: 'Nome do valor da sua aplicação',
    add_button: 'Adicionar outro',
  },
};

export default Object.freeze(application_details);
