const connector_details = {
  page_title: 'Verbindungsdetails',
  back_to_connectors: 'Zurück zu Connectoren',
  check_readme: 'Zur README',
  settings: 'Allgemeine Einstellungen',
  settings_description:
    'Connectoren spielen eine wichtige Rolle in Logto. Mit ihrer Hilfe ermöglicht Logto Endbenutzern eine passwortlose Registrierung oder Anmeldung sowie die Möglichkeit, sich mit Social Accounts anzumelden.',
  save_error_empty_config: 'Bitte fülle die Konfiguration aus',
  parameter_configuration: 'Parameter-Konfiguration',
  test_connection: 'Verbindung testen',
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
  type_email: 'E-Mail Connector',
  type_sms: 'SMS Connector',
  type_social: 'Social Connector',
  in_used_social_deletion_description:
    'Dieser Connector wird in Ihrem Anmeldeerlebnis verwendet. Durch das Löschen wird das Anmeldeerlebnis in den Anmeldeerlebniseinstellungen gelöscht. Wenn Sie ihn wieder hinzufügen möchten, müssen Sie ihn erneut konfigurieren.',
  in_used_passwordless_deletion_description:
    'Dieser {{name}} wird in Ihrem Anmeldeerlebnis verwendet. Wenn Sie ihn löschen, funktioniert Ihr Anmeldeerlebnis nicht ordnungsgemäß, bis Sie das Problem gelöst haben. Wenn Sie ihn wieder hinzufügen möchten, müssen Sie ihn erneut konfigurieren.',
  deletion_description:
    'Sie entfernen diesen Connector. Dies kann nicht rückgängig gemacht werden, und Sie müssen ihn erneut konfigurieren, wenn Sie ihn wieder hinzufügen möchten.',
};

export default connector_details;
