const oidc = {
  aborted: "L'utilisateur a abandonné l'interaction.",
  /** UNTRANSLATED */
  invalid_scope: 'Invalid scope: {{error_description}}.',
  invalid_token: 'Jeton fournis invalide.',
  invalid_client_metadata: 'Les métadonnées du client fournies sont invalides.',
  /** UNTRANSLATED */
  insufficient_scope: 'Token missing scope `{{scope}}`.',
  invalid_request: 'La requête est invalide.',
  invalid_grant: 'Grant request is invalid.',
  invalid_redirect_uri:
    '`redirect_uri` ne correspondait à aucun des `redirect_uris` enregistrés par le client.',
  access_denied: 'Accès refusé.',
  invalid_target: 'Indicateur de ressource invalide.',
  unsupported_grant_type: "Le `grant_type` demandé n'est pas supporté.",
  unsupported_response_mode: "Le `response_mode` demandé n'est pas supporté.",
  unsupported_response_type: "Le `response_type` demandé n'est pas supporté.",
  provider_error: "Erreur interne de l'OIDC : {{message}}.",
  /** UNTRANSLATED */
  server_error: 'An unknown OIDC error occurred. Please try again later.',
  /** UNTRANSLATED */
  provider_error_fallback: 'An OIDC error occurred: {{code}}.',
  /** UNTRANSLATED */
  key_required: 'At least one key is required.',
  /** UNTRANSLATED */
  key_not_found: 'Key with ID {{id}} is not found.',
};

export default Object.freeze(oidc);
