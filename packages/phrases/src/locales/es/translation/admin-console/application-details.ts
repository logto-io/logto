const detalles_aplicacion = {
  page_title: 'Detalles de la aplicación',
  back_to_applications: 'Volver a Aplicaciones',
  check_guide: 'Revisar Guía',
  settings: 'Configuraciones',
  settings_description:
    'Las aplicaciones se utilizan para identificar tus aplicaciones en Logto para OIDC, experiencia de inicio de sesión, registros de auditoría, etc.',
  advanced_settings: 'Configuraciones Avanzadas',
  advanced_settings_description:
    'Las configuraciones avanzadas incluyen términos relacionados con OIDC. Puedes revisar el Endpoint del Token para obtener más información.',
  application_name: 'Nombre de Aplicación',
  application_name_placeholder: 'Mi App',
  description: 'Descripción',
  description_placeholder: 'Ingresa la descripción de tu aplicación',
  authorization_endpoint: 'Endpoint de Autorización',
  authorization_endpoint_tip:
    'El endpoint para la autenticación y autorización. Se utiliza para OpenID Connect <a>Autenticación</a>.',
  application_id: 'ID de Aplicación',
  application_id_tip:
    'El identificador de aplicación único normalmente generado por Logto. También se conoce como “<a>client_id</a>” en OpenID Connect.',
  application_secret: 'Aplicación Secreta',
  redirect_uri: 'URI de Redirección',
  redirect_uris: 'URIs de Redirección',
  redirect_uri_placeholder: 'https://tu.pagina.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'El URI hacia donde se redirecciona después de que un usuario inicie sesión (correctamente o no). Consulta OpenID Connect <a>AuthRequest</a> para más información.',
  post_sign_out_redirect_uri: 'Post Sign-out Redirect URI',
  post_sign_out_redirect_uris: 'Post Sign-out Redirect URIs',
  post_sign_out_redirect_uri_placeholder: 'https://tu.pagina.com/home',
  post_sign_out_redirect_uri_tip:
    'El URI hacia donde se redirecciona después de que un usuario cierre sesión (opcional). Puede que no tenga efecto para algunos tipos de aplicaciones.',
  cors_allowed_origins: 'Orígenes permitidos CORS',
  cors_allowed_origins_placeholder: 'https://tu.pagina.com',
  cors_allowed_origins_tip:
    'Por defecto, se permitirán todos los orígenes de los URIs de Redirección. Normalmente no es necesario hacer nada en este campo. Consulta la <a>documentación de MDN</a> para obtener información detallada.',
  id_token_expiration: 'Vencimiento del Token ID',
  refresh_token_expiration: 'Vencimiento del Token de Refresco',
  token_endpoint: 'Endpoint del Token',
  user_info_endpoint: 'Endpoint del Usuario',
  enable_admin_access: 'Habilitar acceso de administrador',
  enable_admin_access_label:
    'Habilita o deshabilita el acceso a la API de Gestión. Una vez habilitado, puedes utilizar tokens de acceso para llamar a la API de Gestión en nombre de esta aplicación.',
  delete_description:
    'Esta acción no se puede deshacer. Eliminará permanentemente la aplicación. Ingresa el nombre de la aplicación <span>{{name}}</span> para confirmar.',
  enter_your_application_name: 'Ingresa el nombre de tu aplicación',
  application_deleted: 'Se ha eliminado exitosamente la aplicación {{name}}',
  redirect_uri_required: 'Debes ingresar al menos un URI de Redirección',
};

export default detalles_aplicacion;
