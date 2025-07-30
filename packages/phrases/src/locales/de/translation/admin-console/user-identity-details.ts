const user_identity_details = {
  social_identity_page_title: 'Details zur sozialen Identität',
  back_to_user_details: 'Zurück zu den Benutzerdetails',
  delete_identity: `Entfernen der Identitätsverbindung`,
  social_account: {
    title: 'Sozialkonto',
    description:
      'Benutzerdaten und Profilinformationen anzeigen, die vom verknüpften {{connectorName}}-Konto synchronisiert wurden.',
    provider_name: 'Name des Anbieters sozialer Identitäten',
    identity_id: 'Soziale Identitäts-ID',
    user_profile: 'Vom Anbieter sozialer Identitäten synchronisiertes Benutzerprofil',
  },
  sso_account: {
    title: 'Enterprise-SSO-Konto',
    description:
      'Benutzerdaten und Profilinformationen anzeigen, die vom verknüpften {{connectorName}}-Konto synchronisiert wurden.',
    provider_name: 'Name des Anbieters der Enterprise-SSO-Identität',
    identity_id: 'Enterprise-SSO-Identitäts-ID',
    user_profile: 'Vom Enterprise-SSO-Identitätsanbieter synchronisiertes Benutzerprofil',
  },
  token_storage: {
    title: 'Zugriffstoken',
    description:
      'Zugriffs- und Aktualisierungstoken von {{connectorName}} im Geheimvorrat speichern. Ermöglicht automatisierte API-Aufrufe ohne wiederholte Zustimmung des Benutzers.',
  },
  access_token: {
    title: 'Zugriffstoken',
    description_active:
      'Das Zugriffstoken ist aktiv und sicher im Geheimvorrat gespeichert. Ihr Produkt kann es verwenden, um auf die {{connectorName}}-APIs zuzugreifen.',
    description_inactive:
      'Dieses Zugriffstoken ist inaktiv (z. B. widerrufen). Benutzer müssen den Zugriff erneut autorisieren, um die Funktionalität wiederherzustellen.',
    description_expired:
      'Dieses Zugriffstoken ist abgelaufen. Die Erneuerung erfolgt automatisch bei der nächsten API-Anforderung mit dem Aktualisierungstoken. Wenn das Aktualisierungstoken nicht verfügbar ist, ist eine erneute Authentifizierung des Benutzers erforderlich.',
  },
  refresh_token: {
    available:
      'Aktualisierungstoken ist verfügbar. Wenn das Zugriffstoken abläuft, wird es automatisch mit dem Aktualisierungstoken aktualisiert.',
    not_available:
      'Aktualisierungstoken ist nicht verfügbar. Nachdem das Zugriffstoken abgelaufen ist, müssen sich Benutzer erneut authentifizieren, um neue Token zu erhalten.',
  },
  token_status: 'Token-Status',
  created_at: 'Erstellt am',
  updated_at: 'Aktualisiert am',
  expires_at: 'Läuft ab am',
  scopes: 'Bereiche',
  delete_tokens: {
    title: 'Tokens löschen',
    description:
      'Die gespeicherten Token löschen. Benutzer müssen den Zugriff erneut autorisieren, um die Funktionalität wiederherzustellen.',
    confirmation_message:
      'Sind Sie sicher, dass Sie die Token löschen möchten? Logto Secret Vault entfernt die gespeicherten {{connectorName}} Zugriffs- und Aktualisierungstoken. Dieser Benutzer muss die {{connectorName}} API-Zugriffsrechte erneut autorisieren.',
  },
  token_storage_disabled: {
    title: 'Token-Speicherung ist für diesen Connector deaktiviert',
    description:
      'Benutzer können {{connectorName}} derzeit nur verwenden, um sich anzumelden, Konten zu verknüpfen oder Profile während jedes Zustimmungsvorgangs zu synchronisieren. Um auf {{connectorName}}-APIs zuzugreifen und im Namen von Benutzern Aktionen durchzuführen, aktivieren Sie bitte die Tokenspeicherung in',
  },
};

export default Object.freeze(user_identity_details);
