const enterprise_sso_details = {
  back_to_sso_connectors: 'Volver a los conectores SSO empresariales',
  page_title: 'Detalles del conector de SSO empresarial',
  readme_drawer_title: 'SSO empresarial',
  readme_drawer_subtitle:
    'Configure conectores SSO empresariales para habilitar el SSO de los usuarios finales',
  tab_settings: 'Configuración',
  tab_connection: 'Conexión',
  general_settings_title: 'Configuración general',
  custom_branding_title: 'Marca personalizada',
  custom_branding_description:
    'Personaliza la información de visualización del IdP empresarial para el botón de inicio de sesión y otros escenarios.',
  email_domain_field_name: 'Dominio de correo electrónico empresarial',
  email_domain_field_description:
    'Los usuarios con este dominio de correo electrónico pueden usar SSO para autenticarse. Asegúrese de que el dominio pertenezca a la empresa.',
  email_domain_field_placeholder: 'Dominio de correo electrónico',
  sync_profile_field_name: 'Sincronizar información de perfil desde el proveedor de identidad',
  sync_profile_option: {
    register_only: 'Solo sincronizar al inicio de sesión',
    each_sign_in: 'Siempre sincronizar en cada inicio de sesión',
  },
  connector_name_field_name: 'Nombre del conector',
  connector_logo_field_name: 'Logotipo del conector',
  branding_logo_context: 'Subir logotipo',
  branding_logo_error: 'Error al subir el logotipo: {{error}}',
  branding_logo_field_name: 'Logotipo',
  branding_logo_field_placeholder: 'https://su.domino/logo.png',
  branding_dark_logo_context: 'Subir logotipo en modo oscuro',
  branding_dark_logo_error: 'Error al subir el logotipo en modo oscuro: {{error}}',
  branding_dark_logo_field_name: 'Logotipo (modo oscuro)',
  branding_dark_logo_field_placeholder: 'https://su.domino/logo-modo-oscuro.png',
  check_readme: 'Ver README',
  enterprise_sso_deleted: 'El conector de SSO empresarial se ha eliminado correctamente',
  delete_confirm_modal_title: 'Eliminar conector de SSO empresarial',
  delete_confirm_modal_content:
    '¿Está seguro de que desea eliminar este conector empresarial? Los usuarios de los proveedores de identidad no utilizarán el inicio de sesión único.',
  upload_idp_metadata_title: 'Subir metadatos del IdP',
  upload_idp_metadata_description: 'Configure los metadatos copiados del proveedor de identidad.',
  upload_saml_idp_metadata_info_text_url:
    'Pegue la URL de los metadatos del proveedor de identidad para conectar.',
  upload_saml_idp_metadata_info_text_xml:
    'Pegue los metadatos del proveedor de identidad para conectar.',
  upload_saml_idp_metadata_info_text_manual:
    'Complete los metadatos del proveedor de identidad para conectar.',
  upload_oidc_idp_info_text: 'Complete la información del proveedor de identidad para conectar.',
  service_provider_property_title: 'Configure su servicio en el IdP',
  service_provider_property_description:
    'Cree una nueva integración de la aplicación por {{protocol}} en su {{name}}. Luego pegue los siguientes detalles del proveedor de servicios para configurar {{protocol}}.',
  attribute_mapping_title: 'Asignación de atributos',
  attribute_mapping_description:
    'El `id` y el `email` del usuario son necesarios para sincronizar el perfil del usuario desde el IdP. Ingrese el siguiente nombre y valor en {{name}}.',
  saml_preview: {
    sign_on_url: 'URL de inicio de sesión',
    entity_id: 'Emisor',
    x509_certificate: 'Certificado de firma',
  },
  oidc_preview: {
    authorization_endpoint: 'Punto de autorización',
    token_endpoint: 'Punto de token',
    userinfo_endpoint: 'Punto de información del usuario',
    jwks_uri: 'Punto final de conjunto de claves JSON web',
    issuer: 'Emisor',
  },
};

export default Object.freeze(enterprise_sso_details);
