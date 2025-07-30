const enterprise_sso_details = {
  back_to_sso_connectors: 'Volver a los conectores SSO de la empresa',
  page_title: 'Detalles del conector de SSO empresarial',
  readme_drawer_title: 'SSO empresarial',
  readme_drawer_subtitle:
    'Configure los conectores SSO empresariales para habilitar SSO de usuarios finales',
  tab_experience: 'Experiencia SSO',
  tab_connection: 'Conexión',
  tab_idp_initiated_auth: 'SSO iniciado por IdP',
  general_settings_title: 'General',
  general_settings_description:
    'Configura la experiencia del usuario final y vincula el dominio de correo electrónico empresarial para el flujo de SSO iniciado por el SP.',
  custom_branding_title: 'Visualización',
  custom_branding_description:
    'Personalice el nombre y el logotipo que se muestra en el flujo de inicio de sesión único de los usuarios finales. Cuando está vacío, se utilizan los valores predeterminados.',
  email_domain_field_name: 'Dominio de correo electrónico empresarial',
  email_domain_field_description:
    'Los usuarios con este dominio de correo electrónico pueden utilizar SSO para la autenticación. Verifique que el dominio pertenezca a la empresa.',
  email_domain_field_placeholder: 'Dominio de correo electrónico',
  sync_profile_field_name: 'Sincronizar información de perfil desde el proveedor de identidad',
  sync_profile_option: {
    register_only: 'Solo sincronizar en el primer inicio de sesión',
    each_sign_in: 'Sincronizar siempre en cada inicio de sesión',
  },
  connector_name_field_name: 'Nombre del conector',
  display_name_field_name: 'Nombre para mostrar',
  connector_logo_field_name: 'Mostrar logotipo',
  connector_logo_field_description:
    'Cada imagen debe ser inferior a 500KB, solo se admiten formatos SVG, PNG, JPG, JPEG.',
  branding_logo_context: 'Subir logotipo',
  branding_logo_error: 'Error al subir el logotipo: {{error}}',
  branding_light_logo_context: 'Subir logotipo del modo claro',
  branding_light_logo_error: 'Error al subir el logotipo del modo claro: {{error}}',
  branding_logo_field_name: 'Logotipo',
  branding_logo_field_placeholder: 'https://tu.domino/logo.png',
  branding_dark_logo_context: 'Subir logotipo del modo oscuro',
  branding_dark_logo_error: 'Error al subir el logotipo del modo oscuro: {{error}}',
  branding_dark_logo_field_name: 'Logotipo (modo oscuro)',
  branding_dark_logo_field_placeholder: 'https://tu.domino/logo-modo-oscuro.png',
  check_connection_guide: 'Guía de conexión',
  enterprise_sso_deleted: 'El conector de SSO empresarial se eliminó correctamente',
  delete_confirm_modal_title: 'Eliminar conector de SSO empresarial',
  delete_confirm_modal_content:
    '¿Seguro que quieres eliminar este conector empresarial? Los usuarios de los proveedores de identidad no utilizarán el inicio de sesión único.',
  upload_idp_metadata_title_saml: 'Cargar los metadatos',
  upload_idp_metadata_description_saml:
    'Configure los metadatos copiados del proveedor de identidad.',
  upload_idp_metadata_title_oidc: 'Cargar las credenciales',
  upload_idp_metadata_description_oidc:
    'Configure las credenciales y la información del token OIDC copiados del proveedor de identidad.',
  upload_idp_metadata_button_text: 'Cargar archivo XML de metadatos',
  upload_signing_certificate_button_text: 'Cargar archivo de certificado de firma',
  configure_domain_field_info_text:
    'Agregue el dominio de correo electrónico para guiar a los usuarios empresariales a su proveedor de identidad para el inicio de sesión único.',
  email_domain_field_required:
    'Se requiere el dominio de correo electrónico para habilitar el SSO empresarial.',
  upload_saml_idp_metadata_info_text_url:
    'Pegue la URL de metadatos del proveedor de identidad para conectar.',
  upload_saml_idp_metadata_info_text_xml:
    'Pegue los metadatos del proveedor de identidad para conectar.',
  upload_saml_idp_metadata_info_text_manual:
    'Complete los metadatos del proveedor de identidad para conectar.',
  upload_oidc_idp_info_text: 'Complete la información del proveedor de identidad para conectar.',
  service_provider_property_title: 'Configurar en el IdP',
  service_provider_property_description:
    'Configure una integración de aplicaciones utilizando {{protocol}} en su proveedor de identidad. Ingrese los detalles proporcionados por Logto.',
  attribute_mapping_title: 'Mapeo de atributos',
  attribute_mapping_description:
    'Sincronice perfiles de usuario desde el proveedor de identidad configurando el mapeo de atributos de usuario en el proveedor de identidad o en Logto.',
  saml_preview: {
    sign_on_url: 'URL de inicio de sesión',
    entity_id: 'Emisor',
    x509_certificate: 'Certificado de firma',
    certificate_content: 'Caduca el {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'Punto de autorización',
    token_endpoint: 'Punto de token',
    userinfo_endpoint: 'Punto de información del usuario',
    jwks_uri: 'Punto de conjunto de claves web JSON',
    issuer: 'Emisor',
  },
  idp_initiated_auth_config: {
    card_title: 'SSO iniciado por IdP',
    card_description:
      'El usuario generalmente inicia el proceso de autenticación desde su aplicación utilizando el flujo de SSO iniciado por el SP. NO habilite esta función a menos que sea absolutamente necesario.',
    enable_idp_initiated_sso: 'Habilitar SSO iniciado por IdP',
    enable_idp_initiated_sso_description:
      'Permitir que los usuarios empresariales inicien el proceso de autenticación directamente desde el portal del proveedor de identidad. Comprende los posibles riesgos de seguridad antes de habilitar esta función.',
    default_application: 'Aplicación predeterminada',
    default_application_tooltip:
      'Aplicación de destino a la que el usuario será redirigido después de la autenticación.',
    empty_applications_error:
      'No se encontraron aplicaciones. Por favor, añade una en la sección de <a>Aplicaciones</a>.',
    empty_applications_placeholder: 'Sin aplicaciones',
    authentication_type: 'Tipo de autenticación',
    auto_authentication_disabled_title: 'Redirigir al cliente para SSO iniciado por SP',
    auto_authentication_disabled_description:
      'Recomendado. Redirige a los usuarios a la aplicación del lado del cliente para iniciar una autenticación OIDC segura iniciada por el SP. Esto evitará los ataques CSRF.',
    auto_authentication_enabled_title: 'Iniciar sesión directamente usando el SSO iniciado por IdP',
    auto_authentication_enabled_description:
      'Después de un inicio de sesión exitoso, los usuarios serán redirigidos al URI de redirección especificado con el código de autorización (sin validación de estado y PKCE).',
    auto_authentication_disabled_app:
      'Para aplicación web tradicional, aplicación de una sola página (SPA)',
    auto_authentication_enabled_app: 'Para aplicación web tradicional',
    idp_initiated_auth_callback_uri: 'URI de devolución de llamada del cliente',
    idp_initiated_auth_callback_uri_tooltip:
      'El URI de devolución de llamada del cliente para iniciar un flujo de autenticación SSO iniciado por el SP. Un ssoConnectorId se añadirá al URI como un parámetro de consulta. (por ejemplo, https://tu.dominio/sso/callback?connectorId={{ssoConnectorId}})',
    redirect_uri: 'URI de redirección posterior al inicio de sesión',
    redirect_uri_tooltip:
      'El URI de redirección para redirigir a los usuarios después de un inicio de sesión exitoso. Logto usará este URI como el URI de redirección OIDC en la solicitud de autorización. Usa un URI dedicado para el flujo de autenticación SSO iniciado por el IdP para una mejor seguridad.',
    empty_redirect_uris_error:
      'No se ha registrado ningún URI de redirección para la aplicación. Por favor, añade uno primero.',
    redirect_uri_placeholder: 'Selecciona un URI de redirección posterior al inicio de sesión',
    auth_params: 'Parámetros de autenticación adicionales',
    auth_params_tooltip:
      'Parámetros adicionales que se pasarán en la solicitud de autorización. Por defecto, solo se solicitarán los ámbitos (openid profile), puedes especificar ámbitos adicionales o un valor de estado exclusivo aquí. (por ejemplo, { "scope": "organizations email", "state": "secret_state" }).',
  },
  trust_unverified_email: 'Confiar en el correo electrónico no verificado',
  trust_unverified_email_label:
    'Confiar siempre en las direcciones de correo electrónico no verificadas devueltas por el proveedor de identidad',
  trust_unverified_email_tip:
    'El conector Entra ID (OIDC) no devuelve la reclamación `email_verified`, lo que significa que las direcciones de correo electrónico de Azure no están garantizadas como verificadas. Por defecto, Logto no sincronizará direcciones de correo electrónico no verificadas con el perfil del usuario. Habilite esta opción solo si confía en todas las direcciones de correo electrónico del directorio Entra ID.',
  offline_access: {
    label: 'Refrescar token de acceso',
    description:
      'Habilita el acceso "offline" de Google para solicitar un token de actualización, permitiendo que tu aplicación refresque el token de acceso sin la reautorización del usuario.',
  },
};

export default Object.freeze(enterprise_sso_details);
