const oidc_configs = {
  sessions_card_title: 'Sessioni Logto',
  sessions_card_description:
    "Personalizza la policy di sessione archiviata dal server di autorizzazione Logto. Registra lo stato di autenticazione globale dell'utente per abilitare l'SSO e consentire la riautenticazione silenziosa tra le app.",
  session_max_ttl_in_days: 'Durata massima della sessione (TTL) in giorni',
  session_max_ttl_in_days_tip:
    "Un limite assoluto di durata dalla creazione della sessione. Indipendentemente dall'attività, la sessione termina allo scadere di questa durata fissa.",
  oss_notice:
    'Per Logto OSS, riavvia la tua istanza dopo ogni aggiornamento della configurazione OIDC (incluse le impostazioni della sessione e la <keyRotationsLink>rotazione delle chiavi</keyRotationsLink>) affinché le modifiche abbiano effetto. Per applicare automaticamente tutti gli aggiornamenti della configurazione OIDC senza riavviare il servizio, <centralCacheLink>abilita la cache centrale</centralCacheLink>.',
};

export default Object.freeze(oidc_configs);
