const application_details = {
  page_title: 'Detalles de la aplicación',
  back_to_applications: 'Volver a Aplicaciones',
  check_guide: 'Revisar Guía',
  settings: 'Configuraciones',
  settings_description:
    'Las aplicaciones se utilizan para identificar tus aplicaciones en Logto para OIDC, experiencia de inicio de sesión, registros de auditoría, etc.',
  /** UNTRANSLATED */
  advanced_settings: 'Advanced settings',
  advanced_settings_description:
    'Las configuraciones avanzadas incluyen términos relacionados con OIDC. Puedes revisar el Endpoint del Token para obtener más información.',
  /** UNTRANSLATED */
  application_roles: 'Roles',
  /** UNTRANSLATED */
  machine_logs: 'Machine logs',
  application_name: 'Nombre de Aplicación',
  application_name_placeholder: 'Mi App',
  description: 'Descripción',
  description_placeholder: 'Ingresa la descripción de tu aplicación',
  config_endpoint: 'Endpoint de configuración del proveedor OpenID',
  authorization_endpoint: 'Endpoint de Autorización',
  authorization_endpoint_tip:
    'El endpoint para la autenticación y autorización. Se utiliza para OpenID Connect <a>Autenticación</a>.',
  logto_endpoint: 'Logto endpoint',
  application_id: 'ID de Aplicación',
  application_id_tip:
    'El identificador de aplicación único normalmente generado por Logto. También se conoce como “<a>client_id</a>” en OpenID Connect.',
  application_secret: 'Aplicación Secreta',
  redirect_uri: 'URI de Redireccionamiento',
  redirect_uris: 'URIs de Redireccionamiento',
  redirect_uri_placeholder: 'https://tu.pagina.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'El URI hacia donde se redirecciona después de que un usuario inicie sesión (correctamente o no). Consulta OpenID Connect <a>AuthRequest</a> para más información.',
  post_sign_out_redirect_uri: 'Post Sign-out URI de Redireccionamiento',
  post_sign_out_redirect_uris: 'Post Sign-out URIs de Redireccionamiento',
  post_sign_out_redirect_uri_placeholder: 'https://tu.pagina.com/home',
  post_sign_out_redirect_uri_tip:
    'El URI hacia donde se redirecciona después de que un usuario cierre sesión (opcional). Puede que no tenga efecto para algunos tipos de aplicaciones.',
  cors_allowed_origins: 'Orígenes permitidos CORS',
  cors_allowed_origins_placeholder: 'https://tu.pagina.com',
  cors_allowed_origins_tip:
    'Por defecto, se permitirán todos los orígenes de los URIs de Redireccionamiento. Normalmente no es necesario hacer nada en este campo. Consulta la <a>documentación de MDN</a> para obtener información detallada.',
  token_endpoint: 'Endpoint del Token',
  user_info_endpoint: 'Endpoint del Usuario',
  enable_admin_access: 'Habilitar acceso de administrador',
  enable_admin_access_label:
    'Habilita o deshabilita el acceso a la API de Gestión. Una vez habilitado, puedes utilizar tokens de acceso para llamar a la API de Gestión en nombre de esta aplicación.',
  always_issue_refresh_token: 'Siempre emitir Token de Refresco',
  always_issue_refresh_token_label:
    'Al habilitar esta configuración, Logto siempre emitirá Tokens de Refresco, independientemente de si se presenta o no “prompt=consent” en la solicitud de autenticación. Sin embargo, esta práctica no está recomendada a menos que sea necesario, ya que no es compatible con OpenID Connect y puede causar problemas potenciales.',
  refresh_token_ttl: 'Tiempo de vida útil del Token de refresco (TTL) en días',
  refresh_token_ttl_tip:
    'La duración durante la cual un token de refresco puede ser utilizado para solicitar nuevos tokens de acceso antes de que expire y se vuelva inválido. Las solicitudes de tokens extenderán el TTL del token de refresco a este valor.',
  rotate_refresh_token: 'Rotar el token de refresco',
  rotate_refresh_token_label:
    'Cuando está habilitado, Logto emitirá un nuevo token de refresco para las solicitudes de token cuando ha pasado el 70 % del tiempo de vida útil (TTL) original o se cumplen ciertas condiciones. <a>Más información</a>',
  delete_description:
    'Esta acción no se puede deshacer. Eliminará permanentemente la aplicación. Ingresa el nombre de la aplicación <span>{{name}}</span> para confirmar.',
  enter_your_application_name: 'Ingresa el nombre de tu aplicación',
  application_deleted: 'Se ha eliminado exitosamente la aplicación {{name}}',
  redirect_uri_required: 'Debes ingresar al menos un URI de Redireccionamiento',
  roles: {
    /** UNTRANSLATED */
    name_column: 'Role',
    /** UNTRANSLATED */
    description_column: 'Description',
    /** UNTRANSLATED */
    assign_button: 'Assign Roles',
    /** UNTRANSLATED */
    delete_description:
      'This action will remove this role from this machine-to-machine app. The role itself will still exist, but it will no longer be associated with this machine-to-machine app.',
    /** UNTRANSLATED */
    deleted: '{{name}} was successfully removed from this user.',
    /** UNTRANSLATED */
    assign_title: 'Assign roles to {{name}}',
    /** UNTRANSLATED */
    assign_subtitle: 'Authorize {{name}} one or more roles',
    /** UNTRANSLATED */
    assign_role_field: 'Assign roles',
    /** UNTRANSLATED */
    role_search_placeholder: 'Search by role name',
    /** UNTRANSLATED */
    added_text: '{{value, number}} added',
    /** UNTRANSLATED */
    assigned_user_count: '{{value, number}} users',
    /** UNTRANSLATED */
    confirm_assign: 'Assign roles',
    /** UNTRANSLATED */
    role_assigned: 'Successfully assigned role(s)',
    /** UNTRANSLATED */
    search: 'Search by role name, description or ID',
    /** UNTRANSLATED */
    empty: 'No role available',
  },
};

export default Object.freeze(application_details);
