const content = {
  terms_of_use: {
    title: 'TERMS',
    description:
      'Füge Nutzungsbedingungen und Datenschutzbestimmungen hinzu, um die Compliance-Anforderungen zu erfüllen.',
    terms_of_use: 'URL der Nutzungsbedingungen',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'URL der Datenschutzerklärung',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: 'Den Bedingungen zustimmen',
    agree_policies: {
      automatic: 'Weiterhin automatisch den Bedingungen zustimmen',
      manual_registration_only: 'Checkbox-Zustimmung nur bei der Registrierung erforderlich',
      manual:
        'Checkbox-Zustimmung sowohl bei der Registrierung als auch beim Anmelden erforderlich',
    },
  },
  languages: {
    title: 'SPRACHEN',
    enable_auto_detect: 'Automatische Erkennung aktivieren',
    description:
      'Deine Software erkennt die Spracheinstellung der Nutzer und wechselt zur entsprechenden Lokalisierung. Du kannst neue Sprachen hinzufügen, indem du die Oberfläche vom Englischen in eine andere Sprache übersetzt.',
    manage_language: 'Sprache verwalten',
    default_language: 'Standardsprache',
    default_language_description_auto:
      'Die Standardsprache wird verwendet, wenn die erkannte Sprache des Nutzers in der aktuellen Sprachbibliothek nicht vorhanden ist.',
    default_language_description_fixed:
      'Wenn die automatische Erkennung deaktiviert ist, zeigt deine Software nur die Standardsprache an. Aktiviere die automatische Erkennung, um weitere Sprachen anzubieten.',
  },
  support: {
    title: 'UNTERSTÜTZUNG',
    subtitle: 'Zeige deine Support-Kanäle auf Fehlerseiten für schnelle Benutzerhilfe an.',
    support_email: 'Support-E-Mail',
    support_email_placeholder: 'support@email.com',
    support_website: 'Support-Website',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: 'Sprache verwalten',
    subtitle:
      'Lokalisiere die Produkterfahrung, indem du Sprachen und Übersetzungen hinzufügst. Dein Beitrag kann als Standardsprache festgelegt werden.',
    add_language: 'Sprache hinzufügen',
    logto_provided: 'Von Logto bereitgestellt',
    key: 'Schlüssel',
    logto_source_values: 'Logto-Quellwerte',
    custom_values: 'Benutzerdefinierte Werte',
    clear_all_tip: 'Alle Werte löschen',
    unsaved_description: 'Änderungen gehen verloren, wenn du diese Seite ohne Speichern verlässt.',
    deletion_tip: 'Sprache löschen',
    deletion_title: 'Möchtest du die hinzugefügte Sprache löschen?',
    deletion_description:
      'Nach dem Löschen können deine Nutzer diese Sprache nicht mehr verwenden.',
    default_language_deletion_title: 'Die Standardsprache kann nicht gelöscht werden.',
    default_language_deletion_description:
      '{{language}} ist als Standardsprache festgelegt und kann nicht gelöscht werden.',
  },
};

export default Object.freeze(content);
