const one_time_token = {
  token_not_found: 'Token {{token}} non trovato.',
  email_mismatch: 'Discrepanza tra email e token fornito.',
  interaction_event_mismatch: 'Il token non può essere utilizzato per questa interazione.',
  token_expired: 'Il token è scaduto.',
  token_consumed: 'Il token è stato consumato.',
  token_revoked: 'Il token è stato revocato.',
  cannot_reactivate_token: 'Impossibile riattivare il token.',
};

export default Object.freeze(one_time_token);
