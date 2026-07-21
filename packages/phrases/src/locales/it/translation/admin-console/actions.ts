const actions = {
  page_title: 'Actions',
  title: 'Actions',
  subtitle:
    'Esegui codice personalizzato in punti specifici del flusso di autenticazione per estendere il comportamento di Logto.',
  status: {
    not_configured: 'Non configurato',
    configured: 'Configurato',
    enabled: 'Abilitato',
    disabled: 'Disabilitato',
  },
  types: {
    post_first_factor_verification: {
      name: 'Dopo la verifica del primo fattore',
      description:
        'Esegui logica personalizzata dopo la verifica del primo fattore di autenticazione e prima che l’accesso continui.',
    },
    post_sign_in: {
      name: 'Dopo l’accesso',
      description:
        'Esegui logica personalizzata dopo che un utente ha effettuato correttamente l’accesso.',
    },
  },
  data_source_tab: 'Origine dati',
  test_tab: 'Contesto di test',
  settings_tab: 'Impostazioni',
  event_data: {
    title: 'Payload dell’evento',
    subtitle: 'Usa il parametro di input `event` per i dati dell’evento di autenticazione.',
  },
  result_data: {
    title: 'Risultato dell’azione',
    subtitle: 'Restituisci un oggetto risultato che Logto comprende per questo tipo di azione.',
  },
  environment_variables: {
    title: 'Imposta le variabili d’ambiente',
    subtitle: 'Usa le variabili d’ambiente per archiviare informazioni sensibili.',
    input_field_title: 'Aggiungi variabili d’ambiente',
    sample_code: 'Accesso alle variabili d’ambiente nel gestore dell’azione. Esempio:',
  },
  fetch_external_data: {
    title: 'Recupera dati esterni',
    subtitle: 'Chiama API esterne dallo script dell’azione.',
    description:
      'Usa la funzione `fetch` per chiamare le tue API esterne e includere i dati nel risultato dell’azione. Esempio:',
  },
  settings: {
    title: 'Impostazioni',
    subtitle: 'Controlla se l’azione è attiva e come vengono gestiti gli errori di runtime.',
    enabled: {
      title: 'Abilita azione',
      description: 'Esegui questo script quando viene attivato l’evento di autenticazione.',
    },
    on_execution_error: {
      title: 'In caso di errore dello script',
      description: 'Scegli come deve comportarsi Logto quando lo script fallisce a runtime.',
      block: 'Blocca il flusso di autenticazione',
      allow: 'Consenti al flusso di autenticazione di continuare',
      post_first_factor_description:
        'Quando questo script fallisce, Logto rifiuta sempre le credenziali non valide così la verifica della password non può essere aggirata.',
    },
  },
  test_context: {
    subtitle: 'Regola il payload dell’evento simulato usato durante i test.',
    input_field_title: 'JSON di esempio dell’evento',
  },
  script: {
    title: 'Script',
    restore: 'Ripristina i valori predefiniti',
    restored: 'Ripristinato',
  },
  tester: {
    run_button: 'Esegui test',
    result_title: 'Risultato del test',
  },
  form_error: {
    invalid_json: 'Formato JSON non valido',
  },
  security_warning: {
    title: 'Avviso di sicurezza',
    description:
      'Gli utenti provisionati da questa azione aggirano le protezioni riservate alla registrazione, inclusa la blocklist email, il dominio solo SSO, la modalità registrazione disabilitata e i controlli del profilo obbligatorio in registrazione. Anche le scritture di profilo e password degli utenti esistenti avvengono prima del completamento della MFA.',
  },
  delete_modal_title: 'Elimina azione',
  delete_modal_content:
    'Vuoi davvero eliminare questa azione? Il flusso di autenticazione non eseguirà più questo script.',
  deleted: 'Azione eliminata',
  created: 'Azione creata',
  saved: 'Azione salvata',
};

export default Object.freeze(actions);
