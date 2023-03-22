const connector_details = {
  back_to_connectors: 'Zurück zu Connectoren',
  check_readme: 'Zur README',
  settings: 'General settings', // UNTRANSLATED
  settings_description:
    'Connectors play a critical role in Logto. With their help, Logto enables end-users to use passwordless registration or sign-in and the capabilities of signing in with social accounts.', // UNTRANSLATED
  save_error_empty_config: 'Bitte fülle die Konfiguration aus',
  parameter_configuration: 'Parameter configuration', // UNTRANSLATED
  test_connection: 'Test connection', // UNTRANSLATED
  send: 'Senden',
  send_error_invalid_format: 'Ungültige Eingabe',
  edit_config_label: 'Gib deine JSON-Konfiguration ein',
  test_email_sender: 'Teste den E-Mail Connector',
  test_sms_sender: 'Teste den SMS Connector',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+49 151 12345678',
  test_message_sent: 'Testnachricht wurde gesendet',
  test_sender_description:
    'Logto verwendet die "Generic"-Vorlage zum Testen. Du erhältst eine Nachricht, wenn dein Connector richtig konfiguriert ist.',
  options_change_email: 'E-Mail Connector bearbeiten',
  options_change_sms: 'SMS Connector bearbeiten',
  connector_deleted: 'Der Connector wurde erfolgreich gelöscht',
  type_email: 'E-Mail connector',
  type_sms: 'SMS connector',
  type_social: 'Social connector',
  in_used_social_deletion_description:
    'This connector is in-use in your sign in experience. By deleting, <name/> sign in experience will be deleted in sign in experience settings.', // UNTRANSLATED
  in_used_passwordless_deletion_description:
    'This {{name}} is in-use in your sign-in experience. By deleting, your sign-in experience will not work properly until you resolve the conflict.', // UNTRANSLATED
  deletion_description:
    'You are removing this connector. It cannot be undone, and you will need to configure it manually if you decide to add it back.', // UNTRANSLATED
};

export default connector_details;
