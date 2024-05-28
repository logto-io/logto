const application_details = {
  page_title: 'Detalles de la aplicación',
  back_to_applications: 'Volver a Aplicaciones',
  check_guide: 'Revisar Guía',
  settings: 'Configuraciones',
  settings_description:
    'An "Application" is a registered software or service that can access user info or act for a user. Applications help recognize who’s asking for what from Logto and handle the sign-in and permission. Fill in the required fields for authentication.',
  integration: 'Integración',
  integration_description:
    'Despliega con los trabajadores seguros de Logto, potenciados por la red global de Cloudflare para un rendimiento de primer nivel y arranques instantáneos de 0ms a nivel mundial.',
  service_configuration: 'Configuración del servicio',
  service_configuration_description: 'Completa las configuraciones necesarias en tu servicio.',
  session: 'Sesión',
  endpoints_and_credentials: 'Endpoints y Credenciales',
  endpoints_and_credentials_description:
    'Utiliza los siguientes endpoints y credenciales para configurar la conexión OIDC en tu aplicación.',
  refresh_token_settings: 'Token de actualización',
  refresh_token_settings_description:
    'Gestiona las reglas del token de actualización para esta aplicación.',
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
  show_endpoint_details: 'Mostrar detalles del endpoint',
  hide_endpoint_details: 'Ocultar detalles del endpoint',
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
  app_domain_description_1:
    'No dudes en utilizar tu dominio con {{domain}} potenciado por Logto, que es permanentemente válido.',
  app_domain_description_2:
    'No dudes en utilizar tu dominio <domain>{{domain}}</domain>, que es permanentemente válido.',
  custom_rules: 'Reglas de autenticación personalizadas',
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  custom_rules_description:
    'Establece reglas con expresiones regulares para rutas que requieren autenticación. Por defecto: protección de todo el sitio si se deja en blanco.',
  authentication_routes: 'Rutas de autenticación',
  custom_rules_tip:
    "Aquí tienes dos escenarios:<ol><li>Para proteger solo las rutas '/admin' y '/privacy' con autenticación: ^/(admin|privacy)/.*</li><li>Para excluir imágenes JPG de la autenticación: ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    'Redirige tu botón de autenticación utilizando las rutas especificadas. Nota: Estas rutas son irremplazables.',
  protect_origin_server: 'Proteger tu servidor de origen',
  protect_origin_server_description:
    'Asegúrate de proteger tu servidor de origen contra el acceso directo. Consulta la guía para obtener más <a>instrucciones detalladas</a>.',
  session_duration: 'Duración de la sesión (días)',
  try_it: 'Probar',
  branding: {
    name: 'Marca',
    description:
      'Personaliza el nombre y el logotipo de tu aplicación en la pantalla de consentimiento.',
    more_info: 'Más información',
    more_info_description:
      'Ofrece a los usuarios más detalles sobre tu aplicación en la pantalla de consentimiento.',
    display_name: 'Nombre a Mostrar',
    display_logo: 'Logotipo a Mostrar',
    display_logo_dark: 'Logotipo a Mostrar (oscuro)',
    terms_of_use_url: 'URL de Términos de Uso de la Aplicación',
    privacy_policy_url: 'URL de Política de Privacidad de la Aplicación',
  },
  permissions: {
    name: 'Permisos',
    description:
      'Selecciona los permisos que la aplicación de terceros requiere para la autorización de usuarios a acceder a tipos específicos de datos.',
    user_permissions: 'Datos personales del usuario',
    organization_permissions: 'Acceso a la organización',
    table_name: 'Conceder permisos',
    field_name: 'Permiso',
    field_description: 'Mostrado en la pantalla de consentimiento',
    delete_text: 'Eliminar permiso',
    permission_delete_confirm:
      'Esta acción retirará los permisos otorgados a la aplicación de terceros, impidiendo que solicite autorización de usuarios para tipos específicos de datos. ¿Estás seguro de que deseas continuar?',
    permissions_assignment_description:
      'Selecciona los permisos que la aplicación de terceros solicita para la autorización de usuarios a acceder a tipos específicos de datos.',
    user_profile: 'Datos del usuario',
    api_permissions: 'Permisos de API',
    organization: 'Permisos de organización',
    user_permissions_assignment_form_title: 'Añadir permisos del perfil de usuario',
    organization_permissions_assignment_form_title: 'Añadir permisos de organización',
    api_resource_permissions_assignment_form_title: 'Añadir permisos de recurso de API',
    user_data_permission_description_tips:
      'Puedes modificar la descripción de los permisos de datos personales del usuario a través de "Experiencia de Inicio de Sesión > Contenido > Administrar Idioma"',
    permission_description_tips:
      'Cuando Logto es utilizado como un Proveedor de Identidad (IdP) para autenticación en aplicaciones de terceros, y se solicita autorización a los usuarios, esta descripción aparece en la pantalla de consentimiento.',
    user_title: 'Usuario',
    user_description:
      'Selecciona los permisos solicitados por la aplicación de terceros para acceder a datos específicos del usuario.',
    grant_user_level_permissions: 'Conceder permisos de datos de usuario',
    organization_title: 'Organización',
    organization_description:
      'Selecciona los permisos solicitados por la aplicación de terceros para acceder a datos específicos de la organización.',
    grant_organization_level_permissions: 'Conceder permisos de datos de organización',
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
