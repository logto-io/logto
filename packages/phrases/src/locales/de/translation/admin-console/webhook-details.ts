const webhook_details = {
  page_title: 'Webhook-Details',
  back_to_webhooks: 'Zurück zu Webhooks',
  not_in_use: 'Nicht in Nutzung',
  success_rate: 'Erfolgsrate',
  requests: '{{value, number}} Requests in 24 Stunden',
  disable_webhook: 'Webhook deaktivieren',
  disable_reminder:
    'Sind Sie sicher, dass Sie diesen Webhook reaktivieren möchten? Wenn Sie das tun, wird keine HTTP-Anforderung an die Endpunkt-URL gesendet.',
  webhook_disabled: 'Der Webhook wurde deaktiviert.',
  webhook_reactivated: 'Der Webhook wurde reaktiviert.',
  reactivate_webhook: 'Webhook reaktivieren',
  delete_webhook: 'Webhook löschen',
  deletion_reminder:
    'Sie entfernen diesen Webhook. Nach dem Löschen wird keine HTTP-Anforderung an die Endpunkt-URL gesendet.',
  deleted: 'Der Webhook wurde erfolgreich gelöscht.',
  settings_tab: 'Einstellungen',
  recent_requests_tab: 'Letzte Anforderungen (24h)',
  settings: {
    settings: 'Einstellungen',
    settings_description:
      'Webhooks ermöglichen es Ihnen, Echtzeit-Updates zu bestimmten Ereignissen zu erhalten, indem sie eine POST-Anforderung an Ihre Endpunkt-URL senden. Dies ermöglicht es Ihnen, sofortige Maßnahmen aufgrund der neuen Informationen zu ergreifen, die Sie erhalten.',
    events: 'Ereignisse',
    events_description:
      'Wählen Sie die Auslöserereignisse aus, die Logto die POST-Anforderung senden wird.',
    name: 'Name',
    endpoint_url: 'Endpunkt-URL',
    signing_key: 'Signing Key',
    signing_key_tip:
      'Fügen Sie den von Logto bereitgestellten geheimen Schlüssel als Anforderungsheader zu Ihrem Endpunkt hinzu, um die Echtheit der Nutzlast des Webhooks sicherzustellen.',
    regenerate: 'Neu generieren',
    regenerate_key_title: 'Signing Key neu generieren',
    regenerate_key_reminder:
      'Sind Sie sicher, dass Sie den Signing Key ändern möchten? Die Regeneration wird sofort wirksam. Bitte denken Sie daran, den Signing Key synchron in Ihrem Endpunkt zu ändern.',
    regenerated: 'Der Signing Key wurde neu generiert.',
    custom_headers: 'Benutzerdefinierte Header',
    custom_headers_tip:
      'Sie können optional benutzerdefinierte Header zur Nutzlast des Webhooks hinzufügen, um zusätzlichen Kontext oder Metadaten zum Ereignis bereitzustellen.',
    key_duplicated_error: 'Schlüssel können nicht wiederholt werden.',
    key_missing_error: 'Key ist erforderlich.',
    value_missing_error: 'Eine Eingabe ist erforderlich.',
    invalid_key_error: 'Schlüssel ist ungültig',
    invalid_value_error: 'Wert ist ungültig',
    test: 'Test',
    test_webhook: 'Testen Sie Ihren Webhook',
    test_webhook_description:
      'Konfigurieren Sie den Webhook und testen Sie ihn mit Beispieldaten für jede ausgewählte Ereigniskategorie, um eine korrekte Empfangs- und Verarbeitungsfunktion zu überprüfen.',
    send_test_payload: 'Testnutzlast senden',
    test_result: {
      endpoint_url: 'Endpunkt-URL: {{url}}',
      message: 'Nachricht: {{message}}',
      response_status: 'Antwortstatus: {{status, number}}',
      response_body: 'Antwortkörper: {{body}}',
      request_time: 'Anforderungszeit: {{time}}',
      test_success: 'Der Webhook-Test zum Endpunkt war erfolgreich.',
    },
  },
};

export default Object.freeze(webhook_details);
