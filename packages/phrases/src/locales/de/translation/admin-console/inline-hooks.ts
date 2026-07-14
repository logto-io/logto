const inline_hooks = {
  page_title: 'Inline-Hooks',
  title: 'Inline-Hooks',
  subtitle:
    'Führe benutzerdefinierten Code an bestimmten Punkten im Authentifizierungsablauf aus, um das Verhalten von Logto zu erweitern.',
  status: {
    not_configured: 'Nicht konfiguriert',
    configured: 'Konfiguriert',
    enabled: 'Aktiviert',
    disabled: 'Deaktiviert',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'Nach Überprüfung des ersten Faktors',
      description:
        'Führe benutzerdefinierte Logik aus, nachdem der erste Authentifizierungsfaktor überprüft wurde und bevor die Anmeldung fortgesetzt wird.',
    },
    post_sign_in: {
      name: 'Nach der Anmeldung',
      description:
        'Führe benutzerdefinierte Logik aus, nachdem sich ein Benutzer erfolgreich angemeldet hat.',
    },
  },
};

export default Object.freeze(inline_hooks);
