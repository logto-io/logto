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
};

export default connector_details;
