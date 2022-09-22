const application_details = {
  back_to_applications: 'Voltar para aplicações',
  check_guide: 'Guia de verificação',
  advanced_settings: 'Configurações avançadas',
  application_name: 'Nome da aplicação',
  application_name_placeholder: 'Ex: Site Empresa',
  description: 'Descrição',
  description_placeholder: 'Insira a descrição da sua aplicação',
  authorization_endpoint: 'Endpoint de autorização',
  authorization_endpoint_tip:
    'O endpoint para realizar autenticação e autorização. É usado para autenticação OpenID Connect.',
  application_id: 'ID da aplicação',
  application_secret: 'Segredo da aplicação',
  redirect_uri: 'URI de redirecionamento',
  redirect_uris: 'URIs de redirecionamento',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'O URI redireciona após o login de um utilizador (com êxito ou não). Consulte OpenID Connect AuthRequest para obter mais informações.',
  post_sign_out_redirect_uri: 'URI de redirecionamento pós-logout',
  post_sign_out_redirect_uris: 'URIs de redirecionamento pós-logout',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    'O URI redireciona após a saída de um utilizador (opcional). Pode não ter efeito prático em alguns tipos de aplicações.',
  cors_allowed_origins: 'origens permitidas CORS',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    'Por padrão, todas as origens de redirecionamento serão permitidas. Recomenda-se restringir isto.',
  add_another: 'Adicionar outro',
  id_token_expiration: 'Expiração do token de ID',
  refresh_token_expiration: 'Expiração do token de atualização',
  token_endpoint: 'Endpoint Token',
  user_info_endpoint: 'Enpoint Userinfo',
  delete_description:
    'Esta ação não pode ser desfeita. Isso ira eliminar permanentemente a app. Insira o nome da aplicação <span>{{name}}</span> para confirmar.',
  enter_your_application_name: 'Digite o nome da aplicação',
  application_deleted: 'Aplicação {{name}} eliminada com sucesso',
  redirect_uri_required: 'Deve inserir pelo menos um URI de redirecionamento',
};

export default application_details;
