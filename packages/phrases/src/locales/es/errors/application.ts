const application = {
  invalid_type: 'Solo las aplicaciones de máquina a máquina pueden tener roles asociados.',
  role_exists: 'La identificación del rol {{roleId}} ya se ha agregado a esta aplicación.',
  invalid_role_type:
    'No se puede asignar un rol de tipo usuario a una aplicación de máquina a máquina.',
  invalid_third_party_application_type:
    'Solo las aplicaciones web tradicionales, de una sola página y nativas pueden ser marcadas como aplicaciones de terceros.',
  third_party_application_only: 'La función solo está disponible para aplicaciones de terceros.',
  user_consent_scopes_not_found: 'Ámbitos de consentimiento de usuario no válidos.',
  consent_management_api_scopes_not_allowed:
    'Los ámbitos de la API de administración no están permitidos.',
  protected_app_metadata_is_required: 'Se requiere metadatos de aplicación protegida.',
  protected_app_not_configured:
    'El proveedor de aplicación protegida no está configurado. Esta función no está disponible para la versión de código abierto.',
  cloudflare_unknown_error: 'Se produjo un error desconocido al solicitar la API de Cloudflare',
  protected_application_only: 'La función solo está disponible para aplicaciones protegidas.',
  protected_application_misconfigured: 'La aplicación protegida está mal configurada.',
  protected_application_subdomain_exists:
    'El subdominio de la aplicación protegida ya está en uso.',
  invalid_subdomain: 'Subdominio no válido.',
  custom_domain_not_found: 'Dominio personalizado no encontrado.',
  should_delete_custom_domains_first: 'Debe eliminar primero los dominios personalizados.',
  no_legacy_secret_found: 'La aplicación no tiene un secreto heredado.',
  secret_name_exists: 'El nombre del secreto ya existe.',
  saml: {
    use_saml_app_api:
      'Usa la API `[METHOD] /saml-applications(/.*)?` para operar la aplicación SAML.',
    saml_application_only: 'La API solo está disponible para aplicaciones SAML.',
    reach_oss_limit:
      'NO PUEDES crear más aplicaciones SAML porque se ha alcanzado el límite de {{limit}}.',
    acs_url_binding_not_supported:
      'Solo se admite la vinculación HTTP-POST para recibir aserciones SAML.',
    can_not_delete_active_secret: 'No se puede eliminar el secreto activo.',
    no_active_secret: 'No se encontró un secreto activo.',
    entity_id_required: 'Se requiere un ID de entidad para generar metadatos.',
    name_id_format_required: 'Se requiere el formato de ID de nombre.',
    unsupported_name_id_format: 'Formato de ID de nombre no compatible.',
    missing_email_address: 'El usuario no tiene una dirección de correo electrónico.',
    email_address_unverified: 'La dirección de correo electrónico del usuario no está verificada.',
    invalid_certificate_pem_format: 'Formato PEM de certificado no válido',
    acs_url_required: 'La URL del Servicio de Consumidor de Aserciones es requerida.',
    private_key_required: 'Se requiere una clave privada.',
    certificate_required: 'Se requiere un certificado.',
    invalid_saml_request: 'Solicitud de autenticación SAML no válida.',
    auth_request_issuer_not_match:
      'El emisor de la solicitud de autenticación SAML no coincide con el ID de entidad del proveedor de servicios.',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'No se encontró el ID de sesión SSO SAML iniciado por el proveedor de servicios en las cookies.',
    sp_initiated_saml_sso_session_not_found:
      'No se encontró la sesión SSO SAML iniciada por el proveedor de servicios.',
    state_mismatch: 'Desajuste de `state`.',
  },
};

export default Object.freeze(application);
