const sign_up_and_sign_in = {
  identifiers_email: 'Indirizzo email',
  identifiers_phone: 'Numero di telefono',
  identifiers_username: 'Nome utente',
  identifiers_email_or_sms: 'Indirizzo email o numero di telefono',
  identifiers_none: 'Non applicabile',
  and: 'e',
  or: 'o',
  sign_up: {
    title: 'REGISTRATI',
    sign_up_identifier: 'Identificatore di registrazione',
    identifier_description:
      'Tutti gli identificatori di registrazione selezionati sono richiesti quando si crea un nuovo account.',
    sign_up_authentication: "Impostazione dell'autenticazione per la registrazione",
    verification_tip:
      "Gli utenti devono verificare l'email o il numero di telefono che hai configurato inserendo un codice di verifica durante la registrazione.",
    authentication_description:
      'Tutte le azioni selezionate saranno obbligatorie per gli utenti per completare il flusso.',
    set_a_password_option: 'Crea la tua password',
    verify_at_sign_up_option: "Verifica all'atto della registrazione",
    social_only_creation_description:
      '(Questo si applica solo alla creazione di account con i social)',
  },
  sign_in: {
    title: 'ACCEDI',
    sign_in_identifier_and_auth: "Identificatore e impostazioni di autenticazione per l'accesso",
    description: 'Gli utenti possono accedere utilizzando una qualsiasi delle opzioni disponibili.',
    add_sign_in_method: 'Aggiungi metodo di accesso',
    add_sign_up_method: 'Aggiungi metodo di registrazione',
    password_auth: 'Password',
    verification_code_auth: 'Codice di verifica',
    auth_swap_tip: 'Scambia le opzioni sottostanti per determinare quale appare prima nel flusso.',
    require_auth_factor: 'Devi selezionare almeno un fattore di autenticazione.',
    forgot_password_verification_method: 'Metodo di verifica per password dimenticata',
    forgot_password_description:
      'Gli utenti possono reimpostare la password utilizzando qualsiasi metodo di verifica disponibile.',
    add_verification_method: 'Aggiungi metodo di verifica',
    email_verification_code: 'Codice di verifica email',
    phone_verification_code: 'Codice di verifica telefono',
  },
  social_sign_in: {
    title: 'ACCESSO CON I SOCIAL',
    social_sign_in: 'Accesso ai social',
    description:
      "A seconda dell'identificatore obbligatorio che hai impostato, all'utente potrebbe essere chiesto di fornire un identificatore durante la registrazione tramite il connettore social.",
    add_social_connector: 'Aggiungi connettore social',
    set_up_hint: {
      not_in_list: 'Non in lista?',
      set_up_more: 'Imposta',
      go_to: 'altri connettori social ora.',
    },
    automatic_account_linking: "Collegamento automatico dell'account",
    automatic_account_linking_label:
      "Quando attivato, se un utente accede con un'identità sociale nuova per il sistema, e c'è esattamente un account esistente con lo stesso identificatore (ad esempio, email), Logto collegherà automaticamente l'account con l'identità sociale invece di richiedere all'utente il collegamento dell'account.",
  },
  tip: {
    set_a_password: 'Un set unico di password per il tuo nome utente è un must.',
    verify_at_sign_up:
      'Attualmente supportiamo solo la posta elettronica verificata. La tua base utenti potrebbe contenere un gran numero di indirizzi email di bassa qualità se non effettui la convalida.',
    password_auth:
      "Questo è essenziale poiché hai abilitato l'opzione di impostazione della password durante il processo di registrazione.",
    verification_code_auth:
      "Questo è essenziale poiché hai abilitato solo l'opzione di fornire un codice di verifica durante la registrazione. Se consenti l'impostazione della password durante il processo di registrazione, puoi deselezionare la casella.",
    email_mfa_enabled:
      'Il codice di verifica tramite email è già abilitato per MFA, quindi non può essere riutilizzato come metodo di accesso principale per motivi di sicurezza.',
    phone_mfa_enabled:
      'Il codice di verifica tramite telefono è già abilitato per MFA, quindi non può essere riutilizzato come metodo di accesso principale per motivi di sicurezza.',
    delete_sign_in_method:
      'Questo è essenziale in quanto hai selezionato {{identifier}} come identificatore obbligatorio.',
    password_disabled_notification:
      'L\'opzione "Crea la tua password" è disabilitata per la registrazione del nome utente, il che potrebbe impedire agli utenti di accedere. Conferma per procedere con il salvataggio.',
  },
  advanced_options: {
    title: 'OPZIONI AVANZATE',
    enable_single_sign_on: 'Abilita Single Sign-On aziendale (SSO)',
    enable_single_sign_on_description:
      "Consente agli utenti di accedere all'applicazione utilizzando il Single Sign-On con le loro identità aziendali.",
    single_sign_on_hint: {
      prefix: 'Vai a ',
      link: '"Enterprise SSO"',
      suffix: 'sezione per impostare ulteriori connettori aziendali.',
    },
    enable_user_registration: 'Abilita registrazione utente',
    enable_user_registration_description:
      "Abilita o disabilita la registrazione degli utenti. Una volta disabilitata, gli utenti possono comunque essere aggiunti nella console di amministrazione, ma gli utenti non possono più creare account tramite l'interfaccia di accesso.",
    unknown_session_redirect_url: 'URL di reindirizzamento sessione sconosciuta',
    unknown_session_redirect_url_tip:
      "A volte, Logto potrebbe non riconoscere la sessione di un utente nella pagina di accesso, come quando una sessione scade o l'utente aggiunge ai segnalibri o condivide il link di accesso. Per impostazione predefinita, appare un errore 404 di \"sessione sconosciuta\". Per migliorare l'esperienza utente, imposta un URL di fallback per reindirizzare gli utenti alla tua app e riavviare l'autenticazione.",
  },
};

export default Object.freeze(sign_up_and_sign_in);
