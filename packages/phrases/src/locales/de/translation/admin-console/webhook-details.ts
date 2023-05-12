const webhook_details = {
  page_title: 'Webhook-Details',
  back_to_webhooks: 'Zurück zu Webhooks',
  not_in_use: 'Nicht in Nutzung',
  success_rate: '{{value, number}} Erfolgsrate',
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
  recent_requests_tab: 'Letzte Anforderungen',
  settings: {
    settings: 'Einstellungen',
    settings_description:
      'Webhooks ermöglichen es Ihnen, Echtzeit-Updates zu bestimmten Ereignissen zu erhalten, indem sie eine POST-Anforderung an Ihre Endpunkt-URL senden. Dies ermöglicht es Ihnen, sofortige Maßnahmen aufgrund der neuen Informationen zu ergreifen, die Sie erhalten.',
    events: 'Ereignisse',
    events_description:
      'Wählen Sie die Auslöserereignisse aus, die Logto die POST-Anforderung senden wird.',
    name: 'Name',
    endpoint_url: 'Endpunkt-URL',
    endpoint_url_tip:
      'Geben Sie die HTTPS-URL Ihres Endpunkts ein, an die die Nutzlast eines Webhooks gesendet wird, wenn das Ereignis eintritt.',
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
    test: 'Test',
    test_webhook: 'Testen Sie Ihren Webhook',
    test_webhook_description:
      'Bitte schließen Sie die obige Konfiguration ab. Klicken Sie auf den Test-Button und wir senden einzelne Nutzlastbeispiele jedes ausgewählten Ereignisses an Ihre Endpunkt-URL. Dadurch können Sie überprüfen, ob Ihr Endpunkt die Nutzlasten korrekt empfängt und verarbeitet.',
    send_test_payload: 'Testnutzlast senden',
    test_payload_sent: 'Die Nutzlast wurde erfolgreich gesendet!',
  },
};

export default webhook_details;
