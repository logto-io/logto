const oidc = {
  aborted: "L'utilisateur a abandonné l'interaction.",
  invalid_scope: 'Scope invalide : {{error_description}}.',
  invalid_token: 'Jeton fourni invalide.',
  invalid_client_metadata: 'Les métadonnées du client fournies sont invalides.',
  insufficient_scope: 'Manque de champ `{{scope}}` dans le jeton.',
  invalid_request: 'La requête est invalide.',
  invalid_grant: 'La requête de consentement est invalide.',
  invalid_issuer: 'Émetteur invalide.',
  invalid_redirect_uri:
    '`redirect_uri` ne correspond à aucun des `redirect_uris` enregistrés par le client.',
  access_denied: 'Accès refusé.',
  invalid_target: 'Indicateur de ressource invalide.',
  unsupported_grant_type: "Le `grant_type` demandé n'est pas supporté.",
  unsupported_response_mode: "Le `response_mode` demandé n'est pas supporté.",
  unsupported_response_type: "Le `response_type` demandé n'est pas supporté.",
  provider_error: "Erreur interne de l'OIDC : {{message}}.",
  server_error: "Une erreur OIDC inconnue s'est produite. Veuillez réessayer plus tard.",
  provider_error_fallback: "Une erreur OIDC s'est produite : {{code}}.",
  key_required: 'Au moins une clé est requise.',
  key_not_found: "La clé avec l'ID {{id}} n'est pas trouvée.",
  /** UNTRANSLATED */
  invalid_session_payload: 'Invalid session payload.',
};

export default Object.freeze(oidc);
