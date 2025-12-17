const application_details = {
  page_title: 'Detalles de la aplicación',
  back_to_applications: 'Volver a Aplicaciones',
  check_guide: 'Revisar Guía',
  settings: 'Configuraciones',
  settings_description:
    'Una "aplicación" es un software o servicio registrado que puede acceder a la información del usuario o actuar en su nombre. Las aplicaciones ayudan a Logto a reconocer quién solicita qué y gestionan el inicio de sesión y los permisos. Completa los campos obligatorios para la autenticación.',
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
  machine_logs: 'Registros de Máquina',
  application_name: 'Nombre de Aplicación',
  application_name_placeholder: 'Mi App',
  description: 'Descripción',
  description_placeholder: 'Ingresa la descripción de tu aplicación',
  config_endpoint: 'Endpoint de configuración del proveedor OpenID',
  issuer_endpoint: 'Punto de emisión',
  jwks_uri: 'URI de JWKS',
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
  application_secret_other: 'Secretos de la aplicación',
  redirect_uri: 'URI de Redireccionamiento',
  redirect_uris: 'URIs de Redireccionamiento',
  redirect_uri_placeholder: 'https://tu.pagina.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'El URI hacia donde se redirecciona después de que un usuario inicie sesión (correctamente o no). Consulta OpenID Connect <a>AuthRequest</a> para más información.',
  mixed_redirect_uri_warning:
    'Tu tipo de aplicación no es compatible con al menos uno de los URIs de redireccionamiento. No sigue las mejores prácticas y recomendamos encarecidamente mantener los URIs de redireccionamiento consistentes.',
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
  rotate_refresh_token_label_for_public_clients:
    'Cuando está habilitado, Logto emitirá un nuevo token de refresco para cada solicitud de token. <a>Más información</a>',
  backchannel_logout: 'Cierre de sesión por backchannel',
  backchannel_logout_description:
    'Configure el punto de cierre de sesión por backchannel de OpenID Connect y si la sesión es requerida para esta aplicación.',
  backchannel_logout_uri: 'URI de cierre de sesión por backchannel',
  backchannel_logout_uri_session_required: '¿Es necesaria la sesión?',
  backchannel_logout_uri_session_required_description:
    'Cuando está habilitado, el RP requiere que una reclamación `sid` (ID de sesión) se incluya en el token de cierre de sesión para identificar la sesión del RP con el OP cuando se usa el `backchannel_logout_uri`.',
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
  third_party_settings_description:
    'Integra aplicaciones de terceros con Logto como tu Proveedor de Identidad (IdP) usando OIDC / OAuth 2.0, con una pantalla de consentimiento para la autorización del usuario.',
  session_duration: 'Duración de la sesión (días)',
  try_it: 'Probar',
  no_organization_placeholder: 'No se encontró organización. <a>Ir a organizaciones</a>',
  field_custom_data: 'Datos personalizados',
  field_custom_data_tip:
    'Información personalizada adicional de la aplicación no listada en las propiedades predefinidas de la aplicación, como configuraciones específicas del negocio.',
  custom_data_invalid: 'Los datos personalizados deben ser un objeto JSON válido',
  branding: {
    name: 'Marca',
    description:
      'Personaliza el nombre y el logotipo de tu aplicación en la pantalla de consentimiento.',
    description_third_party:
      'Personaliza el nombre y el logotipo de exhibición de tu aplicación en la pantalla de consentimiento.',
    app_logo: 'Logotipo de la aplicación',
    app_level_sie: 'Experiencia de inicio de sesión a nivel de aplicación',
    app_level_sie_switch:
      'Habilita la experiencia de inicio de sesión a nivel de aplicación y configura el branding específico de la aplicación. Si está deshabilitado, se utilizará la experiencia de inicio de sesión omni.',
    more_info: 'Más información',
    more_info_description:
      'Ofrece a los usuarios más detalles sobre tu aplicación en la pantalla de consentimiento.',
    display_name: 'Nombre a Mostrar',
    application_logo: 'Logotipo de la aplicación',
    application_logo_dark: 'Logotipo de la aplicación (oscuro)',
    brand_color: 'Color de la marca',
    brand_color_dark: 'Color de la marca (oscuro)',
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
    oidc_title: 'OIDC',
    oidc_description:
      'Los permisos OIDC principales se configuran automáticamente para tu aplicación. Estos scopes son esenciales para la autenticación y no se muestran en la pantalla de consentimiento del usuario.',
    default_oidc_permissions: 'Permisos OIDC predeterminados',
    permission_column: 'Permiso',
    guide_column: 'Guía',
    openid_permission: 'openid',
    openid_permission_guide:
      "Opcional para el acceso a recursos OAuth.\nObligatorio para la autenticación OIDC. Concede acceso a un token de ID y permite acceder al 'userinfo_endpoint'.",
    offline_access_permission: 'offline_access',
    offline_access_permission_guide:
      'Opcional. Obtiene tokens de actualización para acceso prolongado o tareas en segundo plano.',
  },
  roles: {
    assign_button: 'Asignar roles de máquina a máquina',
    delete_description:
      'Esta acción eliminará este rol de esta aplicación de máquina a máquina. El rol seguirá existiendo, pero ya no estará asociado con esta aplicación de máquina a máquina.',
    deleted: 'Se ha eliminado correctamente {{name}} de este usuario.',
    assign_title: 'Asignar roles de máquina a máquina a {{name}}',
    assign_subtitle:
      'Las aplicaciones de máquina a máquina deben tener roles de tipo máquina a máquina para acceder a los recursos relacionados con la API.',
    assign_role_field: 'Asignar roles de máquina a máquina',
    role_search_placeholder: 'Buscar por nombre de rol',
    added_text: '{{value, number}} añadido',
    assigned_app_count: '{{value, number}} aplicaciones',
    confirm_assign: 'Asignar roles de máquina a máquina',
    role_assigned: 'Rol(es) asignado(s) correctamente',
    search: 'Buscar por nombre de rol, descripción o ID',
    empty: 'No hay roles disponibles',
  },
  secrets: {
    value: 'Valor',
    empty: 'La aplicación no tiene ningún secreto.',
    created_at: 'Creado en',
    expires_at: 'Expira en',
    never: 'Nunca',
    create_new_secret: 'Crear nuevo secreto',
    delete_confirmation:
      'Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este secreto?',
    deleted: 'El secreto ha sido eliminado exitosamente.',
    activated: 'El secreto ha sido activado exitosamente.',
    deactivated: 'El secreto ha sido desactivado exitosamente.',
    legacy_secret: 'Secreto heredado',
    expired: 'Expirado',
    expired_tooltip: 'Este secreto expiró el {{date}}.',
    create_modal: {
      title: 'Crear secreto de aplicación',
      expiration: 'Expiración',
      expiration_description: 'El secreto expirará el {{date}}.',
      expiration_description_never:
        'El secreto nunca expirará. Recomendamos establecer una fecha de expiración para mayor seguridad.',
      days: '{{count}} día',
      days_other: '{{count}} días',
      years: '{{count}} año',
      years_other: '{{count}} años',
      created: 'El secreto {{name}} se ha creado exitosamente.',
    },
    edit_modal: {
      title: 'Editar secreto de aplicación',
      edited: 'El secreto {{name}} ha sido editado exitosamente.',
    },
  },
  saml_idp_config: {
    title: 'Metadatos del IdP SAML',
    description:
      'Utiliza los siguientes metadatos y certificado para configurar el IdP SAML en tu aplicación.',
    metadata_url_label: 'URL de metadatos del IdP',
    single_sign_on_service_url_label: 'URL del servicio de inicio de sesión único',
    idp_entity_id_label: 'ID de entidad del IdP',
  },
  saml_idp_certificates: {
    title: 'Certificado de firma SAML',
    expires_at: 'Expira en',
    finger_print: 'Huella digital',
    status: 'Estado',
    active: 'Activo',
    inactive: 'Inactivo',
  },
  saml_idp_name_id_format: {
    title: 'Formato de ID de Nombre',
    description: 'Selecciona el formato de ID de nombre del IdP SAML.',
    persistent: 'Persistente',
    persistent_description: 'Usar el ID de usuario de Logto como ID de Nombre',
    transient: 'Transitorio',
    transient_description: 'Usar un ID de usuario de una sola vez como ID de Nombre',
    unspecified: 'No especificado',
    unspecified_description: 'Usar el ID de usuario de Logto como ID de Nombre',
    email_address: 'Dirección de correo electrónico',
    email_address_description: 'Usar dirección de correo electrónico como ID de Nombre',
  },
  saml_encryption_config: {
    encrypt_assertion: 'Encriptar afirmación SAML',
    encrypt_assertion_description: 'Al habilitar esta opción, la afirmación SAML será encriptada.',
    encrypt_then_sign: 'Encriptar y luego firmar',
    encrypt_then_sign_description:
      'Al habilitar esta opción, la afirmación SAML será encriptada y luego firmada; de lo contrario, la afirmación SAML será firmada y luego encriptada.',
    certificate: 'Certificado',
    certificate_tooltip:
      'Copia y pega el certificado x509 que recibes de tu proveedor de servicios para encriptar la afirmación SAML.',
    certificate_placeholder:
      '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...\n-----END CERTIFICATE-----\n',
    certificate_missing_error: 'Se requiere un certificado.',
    certificate_invalid_format_error:
      'Se detectó un formato de certificado inválido. Por favor, revisa el formato del certificado e intenta nuevamente.',
  },
  saml_app_attribute_mapping: {
    name: 'Mapeo de atributos',
    title: 'Mapeo de atributos base',
    description:
      'Añade mapeo de atributos para sincronizar el perfil de usuario desde Logto a tu aplicación.',
    col_logto_claims: 'Valor de Logto',
    col_sp_claims: 'Nombre del valor de tu aplicación',
    add_button: 'Añadir otro',
  },
};

export default Object.freeze(application_details);
