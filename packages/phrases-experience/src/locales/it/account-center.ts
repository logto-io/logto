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
    title: 'Collega telefono',
    description:
      'Collega il tuo numero di telefono per accedere o aiutare con il recupero dell’account.',
    verification_title: 'Inserisci il codice di verifica del telefono',
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
    resend: 'Invia di nuovo il codice',
    resend_countdown: "Non l'hai ricevuto? Reinvia dopo {{seconds}} s.",
  },

  email_verification: {
    title: 'Verifica la tua e-mail',
    prepare_description:
      'Conferma che sei tu per proteggere la sicurezza del tuo account. Invia il codice di verifica alla tua e-mail.',
    email_label: 'Indirizzo email',
    send: 'Invia codice di verifica',
    description:
      "Il codice di verifica è stato inviato all'e-mail {{email}}. Inserisci il codice per continuare.",
    resend: 'Invia di nuovo il codice',
    resend_countdown: "Non l'hai ricevuto? Reinvia dopo {{seconds}} s.",
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
    resend: 'Invia di nuovo il codice',
    resend_countdown: "Non l'hai ricevuto? Reinvia dopo {{seconds}} s.",
    error_send_failed: 'Invio del codice di verifica non riuscito. Riprova più tardi.',
    error_verify_failed: 'Verifica non riuscita. Inserisci di nuovo il codice.',
    error_invalid_code: 'Il codice di verifica non è valido o è scaduto.',
  },
  update_success: {
    default: {
      title: 'Aggiornamento riuscito',
      description: 'Le tue modifiche sono state salvate con successo.',
    },
    email: {
      title: 'Indirizzo email aggiornato!',
      description: "L'indirizzo email del tuo account è stato modificato con successo.",
    },
    phone: {
      title: 'Numero di telefono aggiornato!',
      description: 'Il numero di telefono del tuo account è stato modificato con successo.',
    },
    username: {
      title: 'Nome utente aggiornato!',
      description: 'Il nome utente del tuo account è stato modificato con successo.',
    },

    password: {
      title: 'Password aggiornata!',
      description: 'La password del tuo account è stata modificata con successo.',
    },
  },
};

export default Object.freeze(account_center);
