const oidc = {
  aborted: "L'utilisateur a abandonné l'interaction.",
  invalid_scope: "Le scope {{scope}} n'est pas pris en charge.",
  invalid_scope_plural: 'Les scopes {{scopes}} ne sont pas supportés.',
  invalid_token: 'Jeton fournis invalide.',
  invalid_client_metadata: 'Les métadonnées du client fournies sont invalides.',
  insufficient_scope: "Jeton d'accès manquant pour les scopes {{scopes}}.",
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
};
export default oidc;
