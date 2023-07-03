const connector_details = {
  page_title: 'Dettagli del connettore',
  back_to_connectors: 'Torna ai connettori',
  check_readme: 'Verifica README',
  settings: 'Impostazioni generali',
  settings_description:
    "I connettori svolgono un ruolo critico in Logto. Grazie al loro aiuto, Logto consente agli utenti finali di utilizzare la registrazione o l'accesso senza password e le capacità di accedere tramite account social.",
  parameter_configuration: 'Configurazione dei parametri',
  test_connection: 'Test di connessione',
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
      "Logto utilizza SendGrid per l'invio di email sicure e stabili. È completamente gratuito da utilizzare.",
    email_template_title: 'Modello email',
    template_description:
      "L'email integrata utilizza modelli predefiniti per la consegna senza soluzione di continuità delle email di verifica. Non è richiesta alcuna configurazione e puoi personalizzare le informazioni di base del marchio.",
    description_action_text: 'Visualizza i modelli',
    from_email_field: 'Email mittente',
    from_name_field: 'Nome mittente',
    from_name_tip:
      'Personalizza il nome del mittente per le email. Se lasciato vuoto, verrà utilizzato "Verifica" come nome predefinito.',
    from_name_placeholder: 'Il tuo nome mittente',
    company_address_field: 'Indirizzo aziendale',
    company_address_tip:
      "La visualizzazione dell'indirizzo e del codice postale dell'azienda in fondo alle email migliora l'autenticità, fornisce informazioni di contatto e garantisce la conformità.",
    company_address_placeholder: 'Il tuo indirizzo aziendale',
    app_logo_field: "Logo dell'app",
    app_logo_tip:
      'Mostra il logo del tuo marchio in cima alle email. Utilizza la stessa immagine per la modalità chiara e scura.',
    urls_not_allowed: 'URL non sono ammessi',
    test_notes: 'Logto utilizza il modello "Generico" per i test.',
  },
};

export default connector_details;
