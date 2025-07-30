const user_identity_details = {
  social_identity_page_title: 'Dettagli identità sociale',
  back_to_user_details: 'Torna ai dettagli utente',
  delete_identity: `Rimuovi connessione identità`,
  social_account: {
    title: 'Account social',
    description:
      "Visualizza i dati utente e le informazioni del profilo sincronizzati dall'account {{connectorName}} collegato.",
    provider_name: 'Nome del provider di identità sociale',
    identity_id: 'ID identità sociale',
    user_profile: 'Profilo utente sincronizzato dal provider di identità sociale',
  },
  sso_account: {
    title: 'Account SSO aziendale',
    description:
      "Visualizza i dati utente e le informazioni del profilo sincronizzati dall'account {{connectorName}} collegato.",
    provider_name: 'Nome del provider di identità SSO aziendale',
    identity_id: 'ID identità SSO aziendale',
    user_profile: 'Profilo utente sincronizzato dal provider di identità SSO aziendale',
  },
  token_storage: {
    title: 'Token di accesso',
    description:
      "Memorizza i token di accesso e aggiornamento da {{connectorName}} nel Secret Vault. Consente chiamate API automatizzate senza consenso ripetuto dell'utente.",
  },
  access_token: {
    title: 'Token di accesso',
    description_active:
      'Il token di accesso è attivo e memorizzato in modo sicuro nel Secret Vault. Il tuo prodotto può usarlo per accedere alle API di {{connectorName}}.',
    description_inactive:
      "Questo token di accesso è inattivo (ad esempio, revocato). Gli utenti devono ri-autorizzare l'accesso per ripristinare la funzionalità.",
    description_expired:
      "Questo token di accesso è scaduto. Il rinnovo avviene automaticamente alla successiva richiesta API utilizzando il token di aggiornamento. Se il token di aggiornamento non è disponibile, è richiesta una ri-autenticazione dell'utente.",
  },
  refresh_token: {
    available:
      'Il token di aggiornamento è disponibile. Se il token di accesso scade, verrà automaticamente aggiornato utilizzando il token di aggiornamento.',
    not_available:
      'Il token di aggiornamento non è disponibile. Dopo la scadenza del token di accesso, gli utenti devono ri-autenticarsi per ottenere nuovi token.',
  },
  token_status: 'Stato del token',
  created_at: 'Creato il',
  updated_at: 'Aggiornato il',
  expires_at: 'Scade il',
  scopes: 'Ambiti',
  delete_tokens: {
    title: 'Elimina token',
    description:
      "Elimina i token memorizzati. Gli utenti devono ri-autorizzare l'accesso per ripristinare la funzionalità.",
    confirmation_message:
      "Sei sicuro di voler eliminare i token? Il Logto Secret Vault rimuoverà i token di accesso e aggiornamento {{connectorName}} memorizzati. Questo utente deve ri-autorizzare per ripristinare l'accesso alle API {{connectorName}}.",
  },
  token_storage_disabled: {
    title: 'La memorizzazione dei token è disabilitata per questo connettore',
    description:
      'Gli utenti possono attualmente utilizzare {{connectorName}} solo per accedere, collegare account o sincronizzare profili durante ciascun flusso di consenso. Per accedere alle API di {{connectorName}} ed eseguire azioni per conto degli utenti, si prega di abilitare la memorizzazione dei token in',
  },
};

export default Object.freeze(user_identity_details);
