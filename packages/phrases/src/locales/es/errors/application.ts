const application = {
  invalid_type: 'Solo las aplicaciones de máquina a máquina pueden tener roles asociados.',
  role_exists: 'La identificación del rol {{roleId}} ya se ha agregado a esta aplicación.',
  invalid_role_type:
    'No se puede asignar un rol de tipo usuario a una aplicación de máquina a máquina.',
  invalid_third_party_application_type:
    'Solo las aplicaciones web tradicionales pueden ser marcadas como una aplicación de terceros.',
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
};

export default Object.freeze(application);
