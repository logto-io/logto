const application = {
  invalid_type: 'Seules les applications machine à machine peuvent avoir des rôles associés.',
  role_exists: "Le rôle d'identifiant {{roleId}} a déjà été ajouté à cette application.",
  invalid_role_type:
    "Impossible d'assigner un rôle de type utilisateur à une application machine à machine.",
  invalid_third_party_application_type:
    'Seules les applications Web traditionnelles, les applications monopage et les applications natives peuvent être marquées comme applications tierces.',
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
  no_legacy_secret_found: "L'application n'a pas de secret hérité.",
  secret_name_exists: 'Le nom du secret existe déjà.',
  saml: {
    use_saml_app_api:
      "Utilisez l'API `[METHOD] /saml-applications(/.*)?` pour gérer l'application SAML.",
    saml_application_only: "L'API est uniquement disponible pour les applications SAML.",
    reach_oss_limit:
      "Vous NE POUVEZ PAS créer plus d'applications SAML car la limite de {{limit}} est atteinte.",
    acs_url_binding_not_supported:
      'Seul le binding HTTP-POST est pris en charge pour recevoir des assertions SAML.',
    can_not_delete_active_secret: 'Impossible de supprimer le secret actif.',
    no_active_secret: 'Aucun secret actif trouvé.',
    entity_id_required: "L'identifiant de l'entité est requis pour générer les métadonnées.",
    name_id_format_required: 'Le format Name ID est requis.',
    unsupported_name_id_format: 'Format Name ID non pris en charge.',
    missing_email_address: "L'utilisateur n'a pas d'adresse e-mail.",
    email_address_unverified: "L'adresse e-mail de l'utilisateur n'est pas vérifiée.",
    invalid_certificate_pem_format: 'Format PEM de certificat invalide',
    acs_url_required: "L'URL du service consommateur d'assertions est requise.",
    private_key_required: 'La clé privée est requise.',
    certificate_required: 'Le certificat est requis.',
    invalid_saml_request: "Requête d'authentification SAML invalide.",
    auth_request_issuer_not_match:
      "L'émetteur de la requête d'authentification SAML ne correspond pas à l'ID d'entité du fournisseur de service.",
    sp_initiated_saml_sso_session_not_found_in_cookies:
      "L'ID de session SSO SAML initiée par le fournisseur de services n'est pas trouvé dans les cookies.",
    sp_initiated_saml_sso_session_not_found:
      'La session SSO SAML initiée par le fournisseur de services est introuvable.',
    state_mismatch: 'Mismatch `state`.',
  },
};

export default Object.freeze(application);
