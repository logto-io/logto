const application_details = {
  back_to_applications: 'Voltar para Aplicativos',
  check_guide: 'Visualize o guia',
  settings: 'Configurações',
  settings_description:
    'Os aplicativos são usados para identificar seus aplicativos no Logto para OIDC, experiência de login, logs de auditoria, etc.',
  advanced_settings: 'Configurações avançadas',
  advanced_settings_description:
    'As configurações avançadas incluem termos relacionados ao OIDC. Você pode conferir o Token Endpoint para obter mais informações.',
  application_name: 'Nome do aplicatio',
  application_name_placeholder: 'My App',
  description: 'Descrição',
  description_placeholder: 'Digite a descrição do seu aplicativo',
  authorization_endpoint: 'Endpoint de autorização',
  authorization_endpoint_tip:
    'O endpoint para executar autenticação e autorização. É usado para autenticação OpenID Connect.',
  application_id: 'ID do aplicativo',
  application_secret: 'Secret do aplicativo',
  redirect_uri: 'URI de redirecionamento',
  redirect_uris: 'URIs de redirecionamento',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'O URI é redirecionado após o login do usuário (seja bem-sucedido ou não). Consulte OpenID Connect AuthRequest para obter mais informações.',
  post_sign_out_redirect_uri: 'URI de redirecionamento Post Sign-out',
  post_sign_out_redirect_uris: 'URIs de redirecionamento Post Sign-out',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    'O URI é redirecionado após a saída do usuário (opcional). Pode não ter efeito prático em alguns tipos de aplicativos.',
  cors_allowed_origins: 'Origens permitidas pelo CORS',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    'Por padrão, todas as origens de URIs de redirecionamento serão permitidas. Normalmente, nenhuma ação é necessária para este campo.',
  add_another: 'Adicionar outro',
  id_token_expiration: 'Expiração do token de ID',
  refresh_token_expiration: 'Expiração Refresh Token',
  token_endpoint: 'Token Endpoint',
  user_info_endpoint: 'Userinfo endpoint',
  enable_admin_access: 'Ativar acesso de administrador',
  enable_admin_access_label:
    'Ative ou desative o acesso à API de gerenciamento. Uma vez ativado, você pode usar tokens de acesso para chamar a API de gerenciamento em nome deste aplicativo.',
  delete_description:
    'Essa ação não pode ser desfeita. Isso excluirá permanentemente o aplicativo. Insira o nome do aplicativo <span>{{name}}</span> para confirmar.',
  enter_your_application_name: 'Digite o nome do seu aplicativo',
  application_deleted: 'O aplicativo {{name}} foi excluído com sucesso',
  redirect_uri_required: 'Você deve inserir pelo menos um URI de redirecionamento',
};

export default application_details;
