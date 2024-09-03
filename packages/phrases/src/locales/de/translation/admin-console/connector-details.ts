const connector_details = {
  page_title: 'Verbindungsdetails',
  back_to_connectors: 'Zurück zu Connectoren',
  check_readme: 'Zur README',
  settings: 'Allgemeine Einstellungen',
  settings_description:
    'Connectoren spielen eine wichtige Rolle in Logto. Mit ihrer Hilfe ermöglicht Logto Endbenutzern eine passwortlose Registrierung oder Anmeldung sowie die Möglichkeit, sich mit Social Accounts anzumelden.',
  parameter_configuration: 'Parameter-Konfiguration',
  test_connection: 'Testen',
  save_error_empty_config: 'Bitte fülle die Konfiguration aus',
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
  logto_email: {
    total_email_sent: 'Gesamtanzahl gesendeter E-Mails: {{value, number}}',
    total_email_sent_tip:
      'Logto verwendet SendGrid für sicheren und stabilen integrierten E-Mail-Versand. Es ist komplett kostenlos. <a>Weitere Informationen</a>',
    email_template_title: 'E-Mail-Vorlage',
    template_description:
      'Der integrierte E-Mail-Versand verwendet Standardvorlagen für eine nahtlose Zustellung von Verifizierungs-E-Mails. Es ist keine Konfiguration erforderlich, und Sie können grundlegende Markeninformationen anpassen.',
    template_description_link_text: 'Vorlagen anzeigen',
    description_action_text: 'Vorlagen anzeigen',
    from_email_field: 'Absender-E-Mail',
    sender_name_field: 'Sender name',
    sender_name_tip:
      'Passen Sie den Absendernamen für E-Mails an. Wenn es leer gelassen wird, wird "Verification" als Standardname verwendet.',
    sender_name_placeholder: 'Ihr Absendername',
    company_information_field: 'Firmeninformationen',
    company_information_description:
      'Zeigen Sie den Firmennamen, die Adresse oder die Postleitzahl am Ende der E-Mails an, um die Authentizität zu erhöhen.',
    company_information_placeholder: 'Die grundlegenden Informationen Ihres Unternehmens',
    email_logo_field: 'E-Mail-Logo',
    email_logo_tip:
      'Zeigen Sie Ihr Markenlogo oben in den E-Mails an. Verwenden Sie dasselbe Bild für den Lichtmodus und den Dunkelmodus.',
    urls_not_allowed: 'URLs sind nicht erlaubt',
    test_notes: 'Logto verwendet die "Generic"-Vorlage zum Testen.',
  },
  google_one_tap: {
    title: 'Google One Tap',
    description:
      'Google One Tap ist eine sichere und einfache Möglichkeit für Benutzer, sich auf Ihrer Website anzumelden.',
    enable_google_one_tap: 'Google One Tap aktivieren',
    enable_google_one_tap_description:
      'Aktivieren Sie Google One Tap in Ihrem Anmeldeerlebnis: Lassen Sie Benutzer sich schnell mit ihrem Google-Konto registrieren oder anmelden, wenn sie bereits auf ihrem Gerät angemeldet sind.',
    configure_google_one_tap: 'Google One Tap konfigurieren',
    auto_select: 'Anmeldeinformationen automatisch auswählen, wenn möglich',
    close_on_tap_outside: 'Aufforderung abbrechen, wenn Benutzer außerhalb klicken/tippen',
    itp_support: '<a>Erweiterten One Tap UX auf ITP-Browsern</a> aktivieren',
  },
};

export default Object.freeze(connector_details);
