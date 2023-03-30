const application_details = {
  page_title: 'Detalhes da aplicação',
  back_to_applications: 'Voltar para aplicações',
  check_guide: 'Guia de verificação',
  settings: 'Definições',
  settings_description:
    'As aplicações são utilizadas para identificar as suas aplicações no Logto para OIDC, experiência de início de sessão, registos de auditoria, etc.',
  advanced_settings: 'Configurações avançadas',
  advanced_settings_description:
    'As configurações avançadas incluem termos relacionados com OIDC. Pode consultar o Endpoint do Token para obter mais informações.',
  application_name: 'Nome da aplicação',
  application_name_placeholder: 'Ex: Site da Empresa',
  description: 'Descrição',
  description_placeholder: 'Insira a descrição da sua aplicação',
  authorization_endpoint: 'Endpoint de autorização',
  authorization_endpoint_tip:
    'O endpoint para realizar a autenticação e autorização. É usado para <a>autenticação</a> OpenID Connect.',
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
  id_token_expiration: 'Expiração do token de ID',
  refresh_token_expiration: 'Expiração do token de atualização',
  token_endpoint: 'Endpoint do token',
  user_info_endpoint: 'Endpoint do Userinfo',
  enable_admin_access: 'Ativar o acesso de administrador',
  enable_admin_access_label:
    'Ativar ou desativar o acesso à API de gestão. Uma vez ativado, pode utilizar tokens de acesso para chamar a API de gestão em nome desta aplicação.',
  delete_description:
    'Esta ação não pode ser revertida. Esta ação irá eliminar permanentemente a aplicação. Insira o nome da aplicação <span>{{name}}</span> para confirmar.',
  enter_your_application_name: 'Insira o nome da aplicação',
  application_deleted: 'Aplicação {{name}} eliminada com sucesso',
  redirect_uri_required: 'Deve inserir pelo menos um URI de redirecionamento',
};

export default application_details;
