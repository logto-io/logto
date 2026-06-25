const profile = {
  link_account: {
    anonymous: 'Anonimo',
  },

  delete_account: {
    title: 'ELIMINA ACCOUNT',
    label: 'Elimina account',
    description:
      'Eliminando il tuo account, verranno rimossi tutti i tuoi dati personali, le informazioni utente, la configurazione. Questa operazione non può essere annullata.',
    button: 'Elimina account',
    p: {
      has_issue:
        'Siamo spiacenti di sapere che vuoi eliminare il tuo account. Prima di poter eliminare il tuo account, devi risolvere i seguenti problemi.',
      after_resolved:
        'Una volta risolti i problemi, puoi eliminare il tuo account. Non esitare a contattarci se hai bisogno di assistenza.',
      check_information:
        'Siamo spiacenti di sapere che vuoi eliminare il tuo account. Per favore controlla attentamente le seguenti informazioni prima di procedere.',
      remove_all_data:
        'Eliminando il tuo account, verranno permanentemente rimossi tutti i dati su di te in Logto Cloud. Per favore assicurati di fare un backup dei dati importanti prima di procedere.',
      confirm_information:
        'Per favore conferma che le informazioni sopra sono quelle che ti aspettavi. Una volta eliminato il tuo account, non saremo in grado di recuperarlo.',
      has_admin_role:
        'Poiché hai il ruolo di amministratore nel seguente tenant, verrà eliminato insieme al tuo account:',
      has_admin_role_other:
        'Poiché hai il ruolo di amministratore nei seguenti tenant, verranno eliminati insieme al tuo account:',
      quit_tenant: 'Stai per lasciare il seguente tenant:',
      quit_tenant_other: 'Stai per lasciare i seguenti tenant:',
    },
    issues: {
      paid_plan:
        "Il seguente tenant ha un piano a pagamento, per favore annulla prima l'abbonamento:",
      paid_plan_other:
        "I seguenti tenant hanno piani a pagamento, per favore annulla prima l'abbonamento:",
      subscription_status: 'Il seguente tenant ha un problema di stato di abbonamento:',
      subscription_status_other: 'I seguenti tenant hanno problemi di stato di abbonamento:',
      open_invoice: 'Il seguente tenant ha una fattura aperta:',
      open_invoice_other: 'I seguenti tenant hanno fatture aperte:',
    },
    error_occurred: 'Si è verificato un errore',
    error_occurred_description:
      "Spiacenti, si è verificato un problema durante l'eliminazione del tuo account:",
    request_id: 'ID richiesta: {{requestId}}',
    try_again_later:
      "Per favore riprova più tardi. Se il problema persiste, contatta il team Logto con l'ID richiesta.",
    final_confirmation: 'Conferma finale',
    about_to_start_deletion:
      'Stai per iniziare il processo di eliminazione e questa azione non può essere annullata.',
    permanently_delete: 'Elimina definitivamente',
  },

  fields: {
    name: 'Nome',
    name_description:
      'Il nome completo dell\'utente in forma visualizzabile, includendo tutte le parti del nome (es. "Mario Rossi").',
    avatar: 'Avatar',
    avatar_description: "URL dell'immagine dell'avatar dell'utente.",
    familyName: 'Cognome',
    familyName_description: 'Il cognome dell\'utente (es. "Rossi").',
    givenName: 'Nome',
    givenName_description: 'Il nome dell\'utente (es. "Mario").',
    middleName: 'Secondo nome',
    middleName_description: 'Il secondo nome dell\'utente (es. "Luigi").',
    nickname: 'Soprannome',
    nickname_description:
      "Nome informale o familiare per l'utente, che può differire dal suo nome legale.",
    preferredUsername: 'Nome utente preferito',
    preferredUsername_description:
      "Identificatore abbreviato con cui l'utente desidera essere referenziato.",
    profile: 'Profilo',
    profile_description:
      "URL della pagina del profilo leggibile dall'uomo dell'utente (es. profilo social).",
    website: 'Sito web',
    website_description: "URL del sito web personale o blog dell'utente.",
    gender: 'Genere',
    gender_description:
      'Il genere auto-identificato dell\'utente (es. "Femmina", "Maschio", "Non-binario").',
    birthdate: 'Data di nascita',
    birthdate_description:
      'La data di nascita dell\'utente in un formato specificato (es. "GG-MM-AAAA").',
    zoneinfo: 'Fuso orario',
    zoneinfo_description:
      'Il fuso orario dell\'utente in formato IANA (es. "Europe/Rome" o "America/New_York").',
    locale: 'Lingua',
    locale_description: 'La lingua dell\'utente in formato IETF BCP 47 (es. "it-IT" o "en-US").',
    address: {
      formatted: 'Indirizzo',
      streetAddress: 'Indirizzo stradale',
      locality: 'Città',
      region: 'Stato/Provincia',
      postalCode: 'CAP',
      country: 'Paese',
    },
    address_description:
      "L'indirizzo completo dell'utente in forma visualizzabile, includendo tutte le parti dell'indirizzo (es. \"Via Roma 123, Milano, Italia 20100\").",
    fullname: 'Nome completo',
    fullname_description:
      'Combina flessibilmente cognome, nome e secondo nome in base alla configurazione.',
  },
};

export default Object.freeze(profile);
