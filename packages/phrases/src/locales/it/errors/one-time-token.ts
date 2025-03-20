const one_time_token = {
  token_not_found: "Token attivo non trovato con l'email e il token forniti.",
  email_mismatch: 'Discrepanza tra email e token fornito.',
  token_expired: 'Il token è scaduto.',
  token_consumed: 'Il token è stato consumato.',
  token_revoked: 'Il token è stato revocato.',
  cannot_reactivate_token: 'Impossibile riattivare il token.',
};

export default Object.freeze(one_time_token);
