const application = {
  invalid_type: 'Seules les applications machine à machine peuvent avoir des rôles associés.',
  role_exists: "Le rôle d'identifiant {{roleId}} a déjà été ajouté à cette application.",
  invalid_role_type:
    "Impossible d'assigner un rôle de type utilisateur à une application machine à machine.",
  invalid_third_party_application_type:
    'Seules les applications Web traditionnelles peuvent être marquées comme une application tierce.',
  third_party_application_only:
    'La fonctionnalité est uniquement disponible pour les applications tierces.',
  user_consent_scopes_not_found: 'Portées de consentement utilisateur invalides.',
  protected_app_metadata_is_required: "Les métadonnées d'application protégée sont requises.",
  /** UNTRANSLATED */
  protected_app_not_configured: 'Protected app provider is not configured.',
  /** UNTRANSLATED */
  cloudflare_unknown_error: 'Got unknown error when requesting Cloudflare API',
};

export default Object.freeze(application);
