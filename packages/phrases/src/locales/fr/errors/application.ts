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
  consent_management_api_scopes_not_allowed:
    "Les scopes de l'API de gestion ne sont pas autorisés.",
  protected_app_metadata_is_required: "Les métadonnées de l'application protégée sont requises.",
  protected_app_not_configured:
    "Le fournisseur d'application protégée n'est pas configuré. Cette fonctionnalité n'est pas disponible dans la version open source.",
  cloudflare_unknown_error: "Erreur inconnue lors de la requête à l'API Cloudflare",
  protected_application_only:
    'La fonctionnalité est uniquement disponible pour les applications protégées.',
  protected_application_misconfigured: "L'application protégée est mal configurée.",
  protected_application_subdomain_exists:
    "Le sous-domaine de l'application protégée est déjà utilisé.",
  invalid_subdomain: 'Sous-domaine invalide.',
  custom_domain_not_found: 'Domaine personnalisé non trouvé.',
  should_delete_custom_domains_first: "Devrait d'abord supprimer les domaines personnalisés.",
};

export default Object.freeze(application);
