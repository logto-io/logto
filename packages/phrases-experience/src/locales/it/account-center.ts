const account_center = {
  header: {
    title: 'Centro account',
  },
  home: {
    title: 'Pagina non trovata',
    description: 'Questa pagina non è disponibile.',
  },
  verification: {
    title: 'Verifica di sicurezza',
    description:
      'Conferma che sei tu per proteggere la sicurezza del tuo account. Seleziona il metodo per verificare la tua identità.',
    error_send_failed: 'Invio del codice di verifica non riuscito. Riprova più tardi.',
    error_invalid_code: 'Il codice di verifica non è valido o è scaduto.',
    error_verify_failed: 'Verifica non riuscita. Inserisci di nuovo il codice.',
    verification_required: 'Verifica scaduta. Conferma di nuovo la tua identità.',
    try_another_method: 'Prova un altro metodo di verifica',
  },
  password_verification: {
    title: 'Verifica la password',
    description:
      'Per proteggere il tuo account, inserisci la password per confermare la tua identità.',
    error_failed: 'Verifica non riuscita. Controlla la tua password.',
  },
  verification_method: {
    password: {
      name: 'Password',
      description: 'Verifica la tua password',
    },
    email: {
      name: 'Codice di verifica e-mail',
      description: 'Invia il codice di verifica alla tua e-mail',
    },
    phone: {
      name: 'Codice di verifica telefonico',
      description: 'Invia il codice di verifica al tuo numero di telefono',
    },
  },
  email: {
    title: "Collega l'email",
    description: "Collega la tua email per accedere o per aiutare con il recupero dell'account.",
    verification_title: 'Inserisci il codice di verifica e-mail',
    verification_description:
      'Il codice di verifica è stato inviato alla tua e-mail {{email_address}}.',
    success: 'Email principale collegata correttamente.',
    verification_required: 'Verifica scaduta. Conferma di nuovo la tua identità.',
  },
  phone: {
    title: 'Collega numero di telefono',
    description:
      "Collega il tuo numero di telefono per accedere o aiutare con il recupero dell'account.",
    verification_title: 'Inserisci il codice di verifica SMS',
    verification_description:
      'Il codice di verifica è stato inviato al tuo telefono {{phone_number}}.',
    success: 'Telefono principale collegato correttamente.',
    verification_required: 'Verifica scaduta. Conferma di nuovo la tua identità.',
  },
  username: {
    title: 'Imposta nome utente',
    description: 'Il nome utente può contenere solo lettere, numeri e trattini bassi.',
    success: 'Nome utente aggiornato con successo.',
  },
  password: {
    title: 'Imposta password',
    description: 'Crea una nuova password per proteggere il tuo account.',
    success: 'Password aggiornata con successo.',
  },

  code_verification: {
    send: 'Invia codice di verifica',
    resend: "Non l'hai ricevuto? <a>Reinvia il codice di verifica</a>",
    resend_countdown: "Non l'hai ricevuto?<span> Reinvia dopo {{seconds}} s.</span>",
  },

  email_verification: {
    title: 'Verifica la tua e-mail',
    prepare_description:
      'Conferma che sei tu per proteggere la sicurezza del tuo account. Invia il codice di verifica alla tua e-mail.',
    email_label: 'Indirizzo email',
    send: 'Invia codice di verifica',
    description:
      "Il codice di verifica è stato inviato all'e-mail {{email}}. Inserisci il codice per continuare.",
    resend: "Non l'hai ricevuto? <a>Reinvia il codice di verifica</a>",
    resend_countdown: "Non l'hai ricevuto?<span> Reinvia dopo {{seconds}} s.</span>",
    error_send_failed: 'Invio del codice di verifica non riuscito. Riprova più tardi.',
    error_verify_failed: 'Verifica non riuscita. Inserisci di nuovo il codice.',
    error_invalid_code: 'Il codice di verifica non è valido o è scaduto.',
  },
  phone_verification: {
    title: 'Verifica il tuo telefono',
    prepare_description:
      'Conferma che sei tu per proteggere la sicurezza del tuo account. Invia il codice di verifica al tuo telefono.',
    phone_label: 'Numero di telefono',
    send: 'Invia codice di verifica',
    description:
      'Il codice di verifica è stato inviato al tuo telefono {{phone}}. Inserisci il codice per continuare.',
    resend: "Non l'hai ricevuto? <a>Reinvia il codice di verifica</a>",
    resend_countdown: "Non l'hai ricevuto?<span> Reinvia dopo {{seconds}} s.</span>",
    error_send_failed: 'Invio del codice di verifica non riuscito. Riprova più tardi.',
    error_verify_failed: 'Verifica non riuscita. Inserisci di nuovo il codice.',
    error_invalid_code: 'Il codice di verifica non è valido o è scaduto.',
  },
  mfa: {
    totp_already_added:
      "Hai già aggiunto un'app di autenticazione. Rimuovi prima quella esistente.",
    totp_not_enabled:
      "L'app di autenticazione non è abilitata. Contatta il tuo amministratore per abilitarla.",
    backup_code_already_added:
      'Hai già codici di backup attivi. Utilizzali o rimuovili prima di generarne di nuovi.',
    backup_code_not_enabled:
      'Il codice di backup non è abilitato. Contatta il tuo amministratore per abilitarlo.',
    backup_code_requires_other_mfa:
      'I codici di backup richiedono che venga prima configurato un altro metodo MFA.',
    passkey_not_enabled: "Passkey non è abilitato. Contatta l'amministratore per abilitarlo.",
  },
  update_success: {
    default: {
      title: 'Aggiornato!',
      description: 'Le tue informazioni sono state aggiornate.',
    },
    password: {
      title: 'Password cambiata!',
      description: 'La tua password è stata aggiornata con successo.',
    },
    username: {
      title: 'Nome utente cambiato!',
      description: 'Il tuo nome utente è stato aggiornato con successo.',
    },
    email: {
      title: 'Email aggiornata!',
      description: 'Il tuo indirizzo email è stato aggiornato con successo.',
    },
    phone: {
      title: 'Numero di telefono aggiornato!',
      description: 'Il tuo numero di telefono è stato aggiornato con successo.',
    },
    social: {
      title: 'Account social collegato!',
      description: 'Il tuo account social è stato collegato con successo.',
    },
    totp: {
      title: 'App di autenticazione aggiunta!',
      description: 'La tua app di autenticazione è stata collegata con successo al tuo account.',
    },
    backup_code: {
      title: 'Codici di backup generati!',
      description: 'I tuoi codici di backup sono stati salvati. Conservali in un luogo sicuro.',
    },
    backup_code_deleted: {
      title: 'Codici di backup rimossi!',
      description: 'I tuoi codici di backup sono stati rimossi dal tuo account.',
    },
    passkey: {
      title: 'Passkey aggiunto!',
      description: 'Il tuo passkey è stato collegato con successo al tuo account.',
    },
    passkey_deleted: {
      title: 'Passkey rimosso!',
      description: 'Il tuo passkey è stato rimosso dal tuo account.',
    },
  },
  backup_code: {
    title: 'Codici di backup',
    description:
      'Puoi utilizzare uno di questi codici di backup per accedere al tuo account se hai problemi durante la verifica in due passaggi in altri modi. Ogni codice può essere utilizzato una sola volta.',
    copy_hint: 'Assicurati di copiarli e salvarli in un luogo sicuro.',
    generate_new_title: 'Genera nuovi codici di backup',
    generate_new: 'Genera nuovi codici di backup',
    delete_confirmation_title: 'Rimuovi i tuoi codici di backup',
    delete_confirmation_description:
      'Se rimuovi questi codici di backup, non potrai più usarli per la verifica.',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Aggiunto: {{date}}',
    last_used: 'Ultimo utilizzo: {{date}}',
    never_used: 'Mai',
    unnamed: 'Passkey senza nome',
    renamed: 'Passkey rinominato con successo.',
    add_another_title: 'Aggiungi un altro passkey',
    add_another_description:
      'Registra il tuo passkey utilizzando la biometria del dispositivo, le chiavi di sicurezza (es. YubiKey) o altri metodi disponibili.',
    add_passkey: 'Aggiungi un passkey',
    delete_confirmation_title: 'Rimuovi passkey',
    delete_confirmation_description:
      'Sei sicuro di voler rimuovere "{{name}}"? Non potrai più utilizzare questo passkey per accedere.',
    rename_passkey: 'Rinomina passkey',
    rename_description: 'Inserisci un nuovo nome per questo passkey.',
  },
};

export default Object.freeze(account_center);
