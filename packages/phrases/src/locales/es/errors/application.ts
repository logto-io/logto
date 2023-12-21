const application = {
  invalid_type: 'Solo las aplicaciones de máquina a máquina pueden tener roles asociados.',
  role_exists: 'La identificación del rol {{roleId}} ya se ha agregado a esta aplicación.',
  invalid_role_type:
    'No se puede asignar un rol de tipo usuario a una aplicación de máquina a máquina.',
  invalid_third_party_application_type:
    'Solo las aplicaciones web tradicionales pueden ser marcadas como una aplicación de terceros.',
  third_party_application_only: 'La función solo está disponible para aplicaciones de terceros.',
  user_consent_scopes_not_found: 'Ámbitos de consentimiento de usuario no válidos.',
  protected_app_metadata_is_required: 'Se requiere metadatos de aplicación protegida.',
  /** UNTRANSLATED */
  protected_app_not_configured: 'Protected app provider is not configured.',
  /** UNTRANSLATED */
  cloudflare_unknown_error: 'Got unknown error when requesting Cloudflare API',
};

export default Object.freeze(application);
