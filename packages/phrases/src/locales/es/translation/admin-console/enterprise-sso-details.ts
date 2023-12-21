const enterprise_sso_details = {
  back_to_sso_connectors: 'Volver a los conectores SSO de la empresa',
  page_title: 'Detalles del conector de SSO empresarial',
  readme_drawer_title: 'SSO empresarial',
  readme_drawer_subtitle:
    'Configure los conectores SSO empresariales para habilitar SSO de usuarios finales',
  tab_experience: 'Experiencia SSO',
  tab_connection: 'Conexión',
  general_settings_title: 'General',
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
};

export default Object.freeze(enterprise_sso_details);
