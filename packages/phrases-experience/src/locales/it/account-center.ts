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
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
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
  email_verification: {
    title: 'Verifica la tua e-mail',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
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
    send: 'Send verification code',
    description:
      'Il codice di verifica è stato inviato al tuo telefono {{phone}}. Inserisci il codice per continuare.',
    resend: 'Invia di nuovo il codice',
    resend_countdown: "Non l'hai ricevuto? Reinvia dopo {{seconds}} s.",
    error_send_failed: 'Invio del codice di verifica non riuscito. Riprova più tardi.',
    error_verify_failed: 'Verifica non riuscita. Inserisci di nuovo il codice.',
    error_invalid_code: 'Il codice di verifica non è valido o è scaduto.',
  },
};

export default Object.freeze(account_center);
