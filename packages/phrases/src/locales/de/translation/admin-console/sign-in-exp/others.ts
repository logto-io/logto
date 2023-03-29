const others = {
  terms_of_use: {
    title: 'Nutzungsbedingungen',
    terms_of_use: 'URL zu den Nutzungsbedingungen',
    terms_of_use_placeholder: 'https://beispiel.de/nutzungsbedingungen',
    privacy_policy: 'URL zu den Datenschutzrichtlinien',
    privacy_policy_placeholder: 'https://beispiel.de/datenschutzrichtlinien',
  },
  languages: {
    title: 'SPRACHEN',
    enable_auto_detect: 'Aktiviere automatische Spracherkennung',
    description:
      'Deine Software erkennt die Sprach-Einstellung des Nutzers und schaltet auf die lokale Sprache um. Du kannst neue Sprachen hinzufügen, indem du die Benutzeroberfläche vom Englischen in eine andere Sprache übersetzt.',
    manage_language: 'Sprachen verwalten',
    default_language: 'Standard-Sprache',
    default_language_description_auto:
      'Die Standardsprache wird verwendet, wenn die erkannte Benutzersprache nicht in der aktuellen Sprachbibliothek enthalten ist.',
    default_language_description_fixed:
      'Wenn die automatische Erkennung deaktiviert ist, ist die Standardsprache die einzige Sprache, die deine Software anzeigt. Schalte die automatische Erkennung ein um weitere Sprachen anzuzeigen.',
  },
  manage_language: {
    title: 'Sprachen verwalten',
    subtitle:
      'Erweitere die Anmeldeoberfläche durch neue Sprachen und Übersetzungen. Deine Übersetzung kann als Standard-Sprache verwendet werden.',
    add_language: 'Sprache hinzufügen',
    logto_provided: 'Von Logto bereitgestellt',
    key: 'Schlüssel',
    logto_source_values: 'Logto Übersetzungen',
    custom_values: 'Benutzerdefinierte Übersetzungen',
    clear_all_tip: 'Alle benutzerdefinierten Übersetzungen löschen',
    unsaved_description:
      'Wenn du diese Seite verlässt, ohne zu speichern, werden die Änderungen nicht gespeichert.',
    deletion_tip: 'Sprache löschen',
    deletion_title: 'Willst du diese Sprache wirklich löschen?',
    deletion_description: 'Nach dem Löschen können deine Benutzer diese Sprache nicht mehr nutzen.',
    default_language_deletion_title: 'Die Standardsprache kann nicht gelöscht werden.',
    default_language_deletion_description:
      '{{language}} ist als Standardsprache eingestellt und kann nicht gelöscht werden. ',
  },
  advanced_options: {
    title: 'ERWEITERTE OPTIONEN',
    enable_create_account: 'Aktiviere Registrierung',
    enable_create_account_description:
      'Aktiviere oder deaktiviere Konto Registrierung. Wenn diese Funktion deaktiviert ist, können deine Kunden keine Konten über die Anmeldeoberfläche erstellen, aber du kannst immer noch Benutzer in der Admin Konsole hinzufügen.',
    enable_user_registration: 'Benutzerregistrierung aktivieren',
    enable_user_registration_description:
      'Aktiviere oder deaktiviere die Benutzerregistrierung. Sobald sie deaktiviert ist, können Benutzer immer noch in der Admin-Konsole hinzugefügt werden, aber Benutzer können keine Konten mehr über die Anmeldeoberfläche erstellen.',
  },
};

export default others;
