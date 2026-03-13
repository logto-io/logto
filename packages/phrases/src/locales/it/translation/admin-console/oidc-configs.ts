const oidc_configs = {
  sessions_card_title: 'Sessioni Logto',
  sessions_card_description:
    "Personalizza la policy di sessione archiviata dal server di autorizzazione Logto. Registra lo stato di autenticazione globale dell'utente per abilitare l'SSO e consentire la riautenticazione silenziosa tra le app.",
  session_max_ttl_in_days: 'Durata massima della sessione (TTL) in giorni',
  session_max_ttl_in_days_tip:
    "Un limite assoluto di durata dalla creazione della sessione. Indipendentemente dall'attività, la sessione termina allo scadere di questa durata fissa.",
};

export default Object.freeze(oidc_configs);
