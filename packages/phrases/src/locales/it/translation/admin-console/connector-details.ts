const connector_details = {
  page_title: 'Dettagli del connettore',
  back_to_connectors: 'Torna ai connettori',
  check_readme: 'Verifica README',
  settings: 'Impostazioni generali',
  settings_description:
    "I connettori svolgono un ruolo critico in Logto. Grazie al loro aiuto, Logto consente agli utenti finali di utilizzare la registrazione o l'accesso senza password e le capacità di accedere tramite account social.",
  parameter_configuration: 'Configurazione dei parametri',
  test_connection: 'Test',
  save_error_empty_config: 'Inserisci la configurazione',
  send: 'Invia',
  send_error_invalid_format: 'Input non valido',
  edit_config_label: 'Inserisci il tuo JSON qui',
  test_email_sender: 'Prova il tuo connettore per email',
  test_sms_sender: 'Prova il tuo connettore per SMS',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+1 555-123-4567',
  test_message_sent: 'Messaggio di prova inviato',
  test_sender_description:
    'Logto utilizza il modello "Generico" per i test. Riceverai un messaggio se il tuo connettore è correttamente configurato.',
  options_change_email: 'Cambia connettore per email',
  options_change_sms: 'Cambia connettore per SMS',
  connector_deleted: 'Il connettore è stato eliminato con successo',
  type_email: 'Connettore per email',
  type_sms: 'Connettore per SMS',
  type_social: 'Connettore social',
  in_used_social_deletion_description:
    "Questo connettore è in uso nella tua esperienza di accesso. Eliminandolo, l'esperienza di accesso di <name/> verrà eliminata nelle impostazioni dell'esperienza di accesso. Dovrai riconfigurarlo se decidi di aggiungerlo di nuovo.",
  in_used_passwordless_deletion_description:
    'Questo {{name}} è in uso nella tua esperienza di accesso. Eliminandolo, la tua esperienza di accesso non funzionerà correttamente fino a quando non risolverai il conflitto. Dovrai riconfigurarlo se decidi di aggiungerlo di nuovo.',
  deletion_description:
    'Stai rimuovendo questo connettore. Non può essere annullato e dovrai riconfigurarlo se decidi di aggiungerlo di nuovo.',
  logto_email: {
    total_email_sent: 'Totale email inviate: {{value, number}}',
    total_email_sent_tip:
      "Logto utilizza SendGrid per l'invio sicuro ed affidabile delle email integrate. È completamente gratuito da utilizzare. <a>Scopri di più</a>",
    email_template_title: 'Modello email',
    template_description:
      "L'email integrata utilizza modelli predefiniti per la consegna senza soluzione di continuità delle email di verifica. Non è richiesta alcuna configurazione e puoi personalizzare le informazioni di base del marchio.",
    template_description_link_text: 'Visualizza modelli',
    description_action_text: 'Visualizza i modelli',
    from_email_field: 'Email mittente',
    sender_name_field: 'Nome mittente',
    sender_name_tip:
      'Personalizza il nome del mittente per le email. Se lasciato vuoto, verrà utilizzato "Verification" come nome predefinito.',
    sender_name_placeholder: 'Il tuo nome mittente',
    company_information_field: 'Informazioni aziendali',
    company_information_description:
      "Mostra il nome dell'azienda, l'indirizzo o il codice postale in fondo alle email per migliorare l'autenticità.",
    company_information_placeholder: 'Le informazioni di base della tua azienda',
    email_logo_field: 'Logo email',
    email_logo_tip:
      'Mostra il logo del tuo marchio in cima alle email. Usa la stessa immagine sia per la modalità chiara che per la modalità scura.',
    urls_not_allowed: 'URL non sono ammessi',
    test_notes: 'Logto utilizza il modello "Generico" per i test.',
  },
  google_one_tap: {
    title: 'Google One Tap',
    description: 'Google One Tap è un modo sicuro e facile per gli utenti di accedere al tuo sito.',
    enable_google_one_tap: 'Abilita Google One Tap',
    enable_google_one_tap_description:
      'Abilita Google One Tap nella tua esperienza di accesso: consenti agli utenti di registrarsi o accedere rapidamente con il loro account Google se sono già connessi sul loro dispositivo.',
    configure_google_one_tap: 'Configura Google One Tap',
    auto_select: 'Seleziona automaticamente le credenziali, se possibile',
    close_on_tap_outside: "Annulla il prompt se l'utente clicca/tocca all'esterno",
    itp_support: 'Abilita <a>UX One Tap migliorato sui browser ITP</a>',
  },
};

export default Object.freeze(connector_details);
