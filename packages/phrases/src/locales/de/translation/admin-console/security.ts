const security = {
  page_title: 'Sicherheit',
  title: 'Sicherheit',
  subtitle: 'Erweiterte Schutzmaßnahmen gegen komplexe Angriffe konfigurieren.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Passwortpolitik',
    general: 'Allgemein',
  },
  bot_protection: {
    title: 'Bot-Schutz',
    description:
      'Aktivieren Sie CAPTCHA für die Anmeldung, Anmeldung und Passwortwiederherstellung, um automatisierte Bedrohungen zu blockieren.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'Wählen Sie einen CAPTCHA-Anbieter aus und richten Sie die Integration ein.',
      add: 'CAPTCHA hinzufügen',
    },
    settings: 'Einstellungen',
    enable_captcha: 'CAPTCHA aktivieren',
    enable_captcha_description:
      'Aktivieren Sie die CAPTCHA-Verifizierung für Anmelde-, Anmelde- und Passwortwiederherstellungsabläufe.',
  },
  create_captcha: {
    setup_captcha: 'CAPTCHA einrichten',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'Googles unternehmensgerechte CAPTCHA-Lösung, die fortschrittliche Bedrohungserkennung und detaillierte Sicherheitsanalysen bietet, um Ihre Website vor betrügerischen Aktivitäten zu schützen.',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'Cloudflares intelligente CAPTCHA-Alternative, die einen nicht aufdringlichen Bot-Schutz bietet und gleichzeitig eine nahtlose Benutzererfahrung ohne visuelle Rätsel gewährleistet.',
    },
  },
  captcha_details: {
    back_to_security: 'Zurück zur Sicherheit',
    page_title: 'CAPTCHA-Details',
    check_readme: 'README überprüfen',
    options_change_captcha: 'CAPTCHA-Anbieter ändern',
    connection: 'Verbindung',
    description: 'Konfigurieren Sie Ihre CAPTCHA-Verbindungen.',
    site_key: 'Seitenschlüssel',
    secret_key: 'Geheimschlüssel',
    project_id: 'Projekt-ID',
    recaptcha_key_id: 'reCAPTCHA-Schlüssel-ID',
    recaptcha_api_key: 'API-Schlüssel des Projekts',
    deletion_description: 'Sind Sie sicher, dass Sie diesen CAPTCHA-Anbieter löschen möchten?',
    captcha_deleted: 'CAPTCHA-Anbieter erfolgreich gelöscht',
    setup_captcha: 'CAPTCHA einrichten',
  },
  password_policy: {
    password_requirements: 'Passwortanforderungen',
    password_requirements_description:
      'Verbessern Sie die Passwortanforderungen, um sich gegen Anmeldeübergriffe und Angriffe mit schwachen Passwörtern zu verteidigen.',
    minimum_length: 'Mindestlänge',
    minimum_length_description:
      'NIST schlägt vor, <a>mindestens 8 Zeichen</a> für Webprodukte zu verwenden.',
    minimum_length_error:
      'Die Mindestlänge muss zwischen {{min}} und {{max}} (einschließlich) sein.',
    minimum_required_char_types: 'Mindestanzahl erforderlicher Zeichentypen',
    minimum_required_char_types_description:
      'Zeichentypen: Großbuchstaben (A-Z), Kleinbuchstaben (a-z), Zahlen (0-9) und Sonderzeichen ({{symbols}}).',
    password_rejection: 'Passwortablehnung',
    compromised_passwords: 'Abgelehnte Passwörter',
    breached_passwords: 'Verletzte Passwörter',
    breached_passwords_description:
      'Ablehnung von zuvor in den Verletzungsdatenbanken gefundenen Passwörtern.',
    restricted_phrases: 'Einschränkung niedrigsicherer Phrasen',
    restricted_phrases_tooltip:
      'Ihr Passwort sollte diese Phrasen vermeiden, es sei denn, Sie kombinieren sie mit 3 oder mehr zusätzlichen Zeichen.',
    repetitive_or_sequential_characters: 'Wiederholte oder aufeinanderfolgende Zeichen',
    repetitive_or_sequential_characters_description: 'Zum Beispiel "AAAA", "1234" und "abcd".',
    user_information: 'Benutzerinformationen',
    user_information_description: 'Zum Beispiel E-Mail-Adresse, Telefonnummer, Benutzername, etc.',
    custom_words: 'Benutzerdefinierte Wörter',
    custom_words_description:
      'Personalisierte kontextspezifische Wörter, Groß-/Kleinschreibung wird nicht beachtet, ein Wort pro Zeile.',
    custom_words_placeholder: 'Name Ihres Dienstes, Firmenname, etc.',
  },
  sentinel_policy: {
    card_title: 'Identifier-Sperre',
    card_description:
      'Sperrt einen Bezeichner vorübergehend nach mehreren fehlgeschlagenen Authentifizierungen (z.B. Anmeldung mit aufeinanderfolgenden falschen Passwörtern oder Bestätigungscodes), um Brute-Force-Zugriffe zu verhindern.',
    max_attempts: {
      title: 'Maximale fehlgeschlagene Versuche',
      description:
        'Begrenzen Sie aufeinanderfolgende fehlgeschlagene Anmeldungen pro Bezeichner. Das Überschreiten dieses Limits löst eine temporäre Sperre aus.',
      error_message: 'Maximale fehlgeschlagene Versuche müssen größer als 0 sein.',
    },
    lockout_duration: {
      title: 'Sperrdauer (Minuten)',
      description:
        'Sperren Sie Anmeldungen für eine Zeit, nachdem das Maximum an fehlgeschlagenen Versuchen überschritten wurde.',
      error_message: 'Die Sperrdauer muss mindestens 1 Minute betragen.',
    },
    manual_unlock: {
      title: 'Manuelle Entsperrung',
      description:
        'Entsperren Sie Benutzer sofort, indem Sie ihre Identität bestätigen und ihren Bezeichner eingeben.',
      unblock_by_identifiers: 'Über Bezeichner entsperren',
      modal_description_1:
        'Ein Bezeichner wurde vorübergehend aufgrund mehrerer fehlgeschlagener Anmelde-/Registrierungsversuche gesperrt. Um die Sicherheit zu schützen, wird der Zugriff nach der Sperrdauer automatisch wiederhergestellt.',
      modal_description_2:
        ' Entsperren Sie manuell nur, wenn Sie die Identität des Benutzers bestätigt haben und sicherstellen, dass keine unbefugten Zugriffsversuche vorliegen.',
      placeholder: 'Bezeichner eingeben (E-Mail-Adresse / Telefonnummer / Benutzername)',
      confirm_button_text: 'Jetzt entsperren',
      success_toast: 'Erfolgreich entsperrt',
      duplicate_identifier_error: 'Bezeichner bereits hinzugefügt',
      empty_identifier_error: 'Bitte geben Sie mindestens einen Bezeichner ein',
    },
  },
};

export default Object.freeze(security);
