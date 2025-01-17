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
  no_legacy_secret_found: "L'application n'a pas de secret hérité.",
  secret_name_exists: 'Le nom du secret existe déjà.',
  saml: {
    /** UNTRANSLATED */
    use_saml_app_api: 'Use `[METHOD] /saml-applications(/.*)?` API to operate SAML app.',
    /** UNTRANSLATED */
    saml_application_only: 'The API is only available for SAML applications.',
    /** UNTRANSLATED */
    acs_url_binding_not_supported:
      'Only HTTP-POST binding is supported for receiving SAML assertions.',
    /** UNTRANSLATED */
    can_not_delete_active_secret: 'Can not delete the active secret.',
    /** UNTRANSLATED */
    no_active_secret: 'No active secret found.',
    /** UNTRANSLATED */
    entity_id_required: 'Entity ID is required to generate metadata.',
    /** UNTRANSLATED */
    name_id_format_required: 'Name ID format is required.',
    /** UNTRANSLATED */
    unsupported_name_id_format: 'Unsupported name ID format.',
    /** UNTRANSLATED */
    missing_email_address: 'User does not have an email address.',
    /** UNTRANSLATED */
    email_address_unverified: 'User email address is not verified.',
    /** UNTRANSLATED */
    invalid_certificate_pem_format: 'Invalid PEM certificate format',
    /** UNTRANSLATED */
    acs_url_required: 'Assertion Consumer Service URL is required.',
    /** UNTRANSLATED */
    private_key_required: 'Private key is required.',
    /** UNTRANSLATED */
    certificate_required: 'Certificate is required.',
    /** UNTRANSLATED */
    invalid_saml_request: 'Invalid SAML authentication request.',
    /** UNTRANSLATED */
    auth_request_issuer_not_match:
      'The issuer of the SAML authentication request mismatch with service provider entity ID.',
    /** UNTRANSLATED */
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'Service provider initiated SAML SSO session ID not found in cookies.',
    /** UNTRANSLATED */
    sp_initiated_saml_sso_session_not_found:
      'Service provider initiated SAML SSO session not found.',
    /** UNTRANSLATED */
    state_mismatch: '`state` mismatch.',
  },
};

export default Object.freeze(application);
