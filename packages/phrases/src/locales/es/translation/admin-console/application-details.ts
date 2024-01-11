const application_details = {
  page_title: 'Detalles de la aplicación',
  back_to_applications: 'Volver a Aplicaciones',
  check_guide: 'Revisar Guía',
  settings: 'Configuraciones',
  settings_description:
    'Las aplicaciones se utilizan para identificar tus aplicaciones en Logto para OIDC, experiencia de inicio de sesión, registros de auditoría, etc.',
  /** UNTRANSLATED */
  endpoints_and_credentials: 'Endpoints & Credentials',
  /** UNTRANSLATED */
  endpoints_and_credentials_description:
    'Use the following endpoints and credentials to set up the OIDC connection in your application.',
  /** UNTRANSLATED */
  refresh_token_settings: 'Refresh token',
  /** UNTRANSLATED */
  refresh_token_settings_description: 'Manage the refresh token rules for this application.',
  application_roles: 'Roles de Aplicación',
  machine_logs: 'Registros de Máquina',
  application_name: 'Nombre de Aplicación',
  application_name_placeholder: 'Mi App',
  description: 'Descripción',
  description_placeholder: 'Ingresa la descripción de tu aplicación',
  config_endpoint: 'Endpoint de configuración del proveedor OpenID',
  authorization_endpoint: 'Endpoint de Autorización',
  authorization_endpoint_tip:
    'El endpoint para la autenticación y autorización. Se utiliza para OpenID Connect <a>Autenticación</a>.',
  /** UNTRANSLATED */
  show_endpoint_details: 'Show endpoint details',
  /** UNTRANSLATED */
  hide_endpoint_details: 'Hide endpoint details',
  logto_endpoint: 'Endpoint de Logto',
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
    user_profile: 'User profile',
    /** UNTRANSLATED */
    api_resource: 'API resource',
    /** UNTRANSLATED */
    organization: 'Organization',
    /** UNTRANSLATED */
    permissions_assignment_form_title: 'Add profile permissions',
  },
  roles: {
    name_column: 'Rol',
    description_column: 'Descripción',
    assign_button: 'Asignar roles',
    delete_description:
      'Esta acción eliminará este rol de esta aplicación de máquina a máquina. El rol seguirá existiendo, pero ya no estará asociado con esta aplicación de máquina a máquina.',
    deleted: 'Se ha eliminado correctamente {{name}} de este usuario.',
    assign_title: 'Asignar roles a {{name}}',
    assign_subtitle: 'Autorizar {{name}} uno o más roles',
    assign_role_field: 'Asignar roles',
    role_search_placeholder: 'Buscar por nombre de rol',
    added_text: '{{value, number}} añadido',
    assigned_app_count: '{{value, number}} aplicaciones',
    confirm_assign: 'Asignar roles',
    role_assigned: 'Rol(es) asignado(s) correctamente',
    search: 'Buscar por nombre de rol, descripción o ID',
    empty: 'No hay roles disponibles',
  },
};

export default Object.freeze(application_details);
