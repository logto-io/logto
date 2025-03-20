const security = {
  page_title: 'Sicherheit',
  title: 'Sicherheit',
  subtitle: 'Erweiterte Schutzmaßnahmen gegen komplexe Angriffe konfigurieren.',
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
};

export default Object.freeze(security);
