const one_time_token = {
  token_not_found: "Aucun jeton actif trouvé avec l'email et le jeton donnés.",
  email_mismatch: "L'email ne correspond pas au jeton fourni.",
  token_expired: 'Le jeton est expiré.',
  token_consumed: 'Le jeton a été consommé.',
  token_revoked: 'Le jeton a été révoqué.',
  cannot_reactivate_token: 'Impossible de réactiver le jeton.',
};

export default Object.freeze(one_time_token);
