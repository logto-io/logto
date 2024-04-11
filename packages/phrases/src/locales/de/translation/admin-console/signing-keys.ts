const signing_keys = {
  title: 'Signierschlüssel',
  description:
    'Verwalten Sie sicher die Signierschlüssel, die von Ihren Anwendungen verwendet werden.',
  private_key: 'OIDC-Privatschlüssel',
  private_keys_description: 'OIDC-Privatschlüssel werden zum Signieren von JWT-Token verwendet.',
  cookie_key: 'OIDC-Cookieschlüssel',
  cookie_keys_description: 'OIDC-Cookieschlüssel werden zum Signieren von Cookies verwendet.',
  private_keys_in_use: 'Verwendete private Schlüssel',
  cookie_keys_in_use: 'Verwendete Cookie-Schlüssel',
  rotate_private_keys: 'Private Schlüssel rotieren',
  rotate_cookie_keys: 'Cookie-Schlüssel rotieren',
  rotate_private_keys_description:
    'Diese Aktion erstellt einen neuen privaten Signierungsschlüssel, rotiert den aktuellen Schlüssel und entfernt Ihren vorherigen Schlüssel. Ihre JWT-Token, die mit dem aktuellen Schlüssel signiert sind, bleiben gültig, bis sie gelöscht oder erneut rotiert werden.',
  rotate_cookie_keys_description:
    'Diese Aktion erstellt einen neuen Cookie-Schlüssel, rotiert den aktuellen Schlüssel und entfernt Ihren vorherigen Schlüssel. Ihre Cookies mit dem aktuellen Schlüssel bleiben gültig, bis sie gelöscht oder erneut rotiert werden.',
  select_private_key_algorithm: 'Signierungsalgorithmus für den neuen privaten Schlüssel auswählen',
  rotate_button: 'Rotieren',
  table_column: {
    id: 'ID',
    status: 'Status',
    algorithm: 'Signierungsschlüssel Algorithmus',
  },
  status: {
    current: 'Aktuell',
    previous: 'Vorherige',
  },
  reminder: {
    rotate_private_key:
      'Sind Sie sicher, dass Sie die <strong>OIDC-Private Keys</strong> rotieren möchten? Neue ausgestellte JWT-Token werden vom neuen Schlüssel signiert. Bestehende JWT-Token bleiben gültig, bis Sie sie erneut rotieren.',
    rotate_cookie_key:
      'Sind Sie sicher, dass Sie die <strong>OIDC-Cookie-Keys</strong> rotieren möchten? Neue Cookies, die in Anmelde-Sitzungen generiert werden, werden mit dem neuen Cookie-Schlüssel signiert. Bestehende Cookies bleiben gültig, bis Sie sie erneut rotieren.',
    delete_private_key:
      'Sind Sie sicher, dass Sie den <strong>OIDC-Privaten Schlüssel</strong> löschen möchten? Bestehende JWT-Token, die mit diesem privaten Signierungsschlüssel signiert wurden, sind nicht mehr gültig.',
    delete_cookie_key:
      'Sind Sie sicher, dass Sie den <strong>OIDC-Cookie-Schlüssel</strong> löschen möchten? Ältere Anmelde-Sitzungen mit Cookies, die mit diesem Cookie-Schlüssel signiert wurden, sind nicht mehr gültig. Eine erneute Authentifizierung ist für diese Benutzer erforderlich.',
  },
  messages: {
    rotate_key_success: 'Signierungsschlüssel erfolgreich rotieren.',
    delete_key_success: 'Schlüssel erfolgreich gelöscht.',
  },
};

export default Object.freeze(signing_keys);
