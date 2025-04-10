const password_policy = {
  password_requirements: 'Passwortanforderungen',
  minimum_length: 'Mindestlänge',
  minimum_length_description:
    'NIST schlägt vor, <a>mindestens 8 Zeichen</a> für Webprodukte zu verwenden.',
  minimum_length_error: 'Die Mindestlänge muss zwischen {{min}} und {{max}} (einschließlich) sein.',
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
};

const security = {
  page_title: 'Sicherheit',
  title: 'Sicherheit',
  subtitle: 'Erweiterte Schutzmaßnahmen gegen komplexe Angriffe konfigurieren.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Passwortpolitik',
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
    captcha_required_flows: 'Erforderliche CAPTCHA-Abläufe',
    sign_up: 'Registrieren',
    sign_in: 'Anmelden',
    forgot_password: 'Passwort vergessen',
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
    deletion_description: 'Sind Sie sicher, dass Sie diesen CAPTCHA-Anbieter löschen möchten?',
    captcha_deleted: 'CAPTCHA-Anbieter erfolgreich gelöscht',
    setup_captcha: 'CAPTCHA einrichten',
  },
  password_policy,
};

export default Object.freeze(security);
