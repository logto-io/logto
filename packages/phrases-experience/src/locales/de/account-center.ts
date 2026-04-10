const account_center = {
  home: {
    title: 'Seite nicht gefunden',
    description: 'Diese Seite ist nicht verfügbar.',
  },
  page: {
    title: 'Konto',
    security_title: 'Sicherheit',
    security_description:
      'Ändern Sie hier Ihre Kontoeinstellungen, um die Sicherheit Ihres Kontos zu gewährleisten.',
    support: 'Hilfe',
  },
  verification: {
    title: 'Sicherheitsüberprüfung',
    description:
      'Bestätige deine Identität, um die Sicherheit deines Kontos zu schützen. Bitte wähle eine Methode zur Verifizierung deiner Identität.',
    error_send_failed:
      'Bestätigungscode konnte nicht gesendet werden. Bitte versuche es später noch einmal.',
    error_invalid_code: 'Der Bestätigungscode ist ungültig oder abgelaufen.',
    error_verify_failed: 'Verifizierung fehlgeschlagen. Bitte gib den Code erneut ein.',
    verification_required: 'Verifizierung abgelaufen. Bitte bestätige deine Identität erneut.',
    try_another_method: 'Versuche eine andere Verifizierungsmethode',
    no_available_methods_title: 'No verification methods available',
    no_available_methods_description:
      "You don't have any verification methods set up. Please add a password, email, or phone number to your account first.",
  },
  password_verification: {
    title: 'Passwort bestätigen',
    description:
      'Zum Schutz deines Kontos gib dein Passwort ein, um deine Identität zu bestätigen.',
    error_failed: 'Falsches Passwort. Bitte überprüfe deine Eingabe.',
  },
  verification_method: {
    password: {
      name: 'Passwort',
      description: 'Bestätige dein Passwort',
    },
    email: {
      name: 'E-Mail-Bestätigungscode',
      description: 'Bestätigungscode an deine E-Mail senden',
    },
    phone: {
      name: 'Telefon-Bestätigungscode',
      description: 'Bestätigungscode an deine Telefonnummer senden',
    },
  },
  email: {
    title: 'E-Mail verknüpfen',
    description:
      'Verknüpfe deine E-Mail, um dich anzumelden oder die Kontowiederherstellung zu erleichtern.',
    verification_title: 'E-Mail-Bestätigungscode eingeben',
    verification_description:
      'Der Bestätigungscode wurde an deine E-Mail {{email_address}} gesendet.',
    success: 'Primäre E-Mail wurde erfolgreich verknüpft.',
    verification_required: 'Verifizierung abgelaufen. Bitte bestätige deine Identität erneut.',
  },
  phone: {
    title: 'Telefonnummer verknüpfen',
    description:
      'Verknüpfe deine Telefonnummer, um dich anzumelden oder die Kontowiederherstellung zu unterstützen.',
    verification_title: 'SMS-Bestätigungscode eingeben',
    verification_description:
      'Der Bestätigungscode wurde an dein Telefon {{phone_number}} gesendet.',
    success: 'Primäre Telefonnummer wurde erfolgreich verknüpft.',
    verification_required: 'Verifizierung abgelaufen. Bitte bestätige deine Identität erneut.',
  },
  username: {
    title: 'Benutzernamen festlegen',
    description: 'Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten.',
    success: 'Benutzername erfolgreich aktualisiert.',
  },
  security: {
    add: 'Hinzufügen',
    change: 'Ändern',
    remove: 'Entfernen',
    not_set: 'Nicht festgelegt',
    social_sign_in: 'Social-Login',
    social_not_linked: 'Nicht verknüpft',
    email_phone: 'E-Mail / Telefon',
    email: 'E-Mail',
    phone: 'Telefon',
    password: 'Passwort',
    configured: 'Konfiguriert',
    not_configured: 'Nicht konfiguriert',
    two_step_verification: '2-Faktor-Authentifizierung',
    authenticator_app: 'Authenticator-App',
    passkeys: 'Passkeys',
    backup_codes: 'Backup-Codes',
    email_verification_code: 'E-Mail-Bestätigungscode',
    phone_verification_code: 'Telefon-Bestätigungscode',
    passkeys_count_one: '{{count}} Passkey',
    passkeys_count_other: '{{count}} Passkeys',
    backup_codes_count_one: '{{count}} Code verbleibend',
    backup_codes_count_other: '{{count}} Codes verbleibend',
    view: 'Ansehen',
    manage: 'Verwalten',
    turn_on_2_step_verification: '2-Faktor-Verifizierung aktivieren',
    turn_on_2_step_verification_description:
      'Fügen Sie eine zusätzliche Sicherheitsebene hinzu. Sie werden bei der Anmeldung zu einem zweiten Verifizierungsschritt aufgefordert.',
    turn_off_2_step_verification: '2-Faktor-Verifizierung deaktivieren',
    turn_off_2_step_verification_description:
      'Das Deaktivieren der 2-Faktor-Verifizierung entfernt die zusätzliche Schutzebene für Ihr Konto bei der Anmeldung. Möchten Sie wirklich fortfahren?',
    disable_2_step_verification: '2-Faktor-Verifizierung deaktivieren',
    no_verification_method_warning:
      'Sie haben keine zweite Verifizierungsmethode hinzugefügt. Fügen Sie mindestens eine hinzu, um die 2-Faktor-Verifizierung bei der Anmeldung zu aktivieren.',
    account_removal: 'Kontolöschung',
    delete_your_account: 'Ihr Konto löschen',
    delete_account: 'Konto löschen',
    remove_email_confirmation_title: 'E-Mail-Adresse entfernen',
    remove_email_confirmation_description:
      'Nach dem Entfernen können Sie sich nicht mehr mit dieser E-Mail-Adresse anmelden. Möchten Sie wirklich fortfahren?',
    remove_phone_confirmation_title: 'Telefonnummer entfernen',
    remove_phone_confirmation_description:
      'Nach dem Entfernen können Sie sich nicht mehr mit dieser Telefonnummer anmelden. Möchten Sie wirklich fortfahren?',
    email_removed: 'E-Mail-Adresse wurde erfolgreich entfernt.',
    phone_removed: 'Telefonnummer wurde erfolgreich entfernt.',
  },
  social: {
    linked: '{{connector}} wurde erfolgreich verknüpft.',
    not_enabled:
      'Diese Social-Login-Methode ist nicht aktiviert. Bitte kontaktieren Sie Ihren Administrator um Hilfe.',
    removed: '{{connector}} wurde erfolgreich entfernt.',
    remove_confirmation_title: 'Soziales Konto entfernen',
    remove_confirmation_description:
      'Wenn Sie {{connector}} entfernen, können Sie sich möglicherweise nicht mehr damit anmelden, bis Sie es erneut hinzufügen.',
  },
  password: {
    title: 'Passwort festlegen',
    description: 'Erstelle ein neues Passwort, um dein Konto zu schützen.',
    success: 'Passwort erfolgreich aktualisiert.',
  },
  code_verification: {
    send: 'Bestätigungscode senden',
    resend: 'Noch nichts erhalten? <a>Bestätigungscode erneut senden</a>',
    resend_countdown: 'Noch nichts erhalten? Erneut senden nach {{seconds}} s.',
  },
  email_verification: {
    title: 'Bestätige deine E-Mail',
    prepare_description:
      'Bestätige deine Identität, um die Sicherheit deines Kontos zu schützen. Sende den Bestätigungscode an deine E-Mail.',
    email_label: 'E-Mail-Adresse',
    send: 'Bestätigungscode senden',
    description:
      'Der Bestätigungscode wurde an deine E-Mail {{email}} gesendet. Gib den Code ein, um fortzufahren.',
    resend: 'Noch nichts erhalten? <a>Bestätigungscode erneut senden</a>',
    not_received: 'Noch nichts erhalten?',
    resend_action: 'Bestätigungscode erneut senden',
    resend_countdown: 'Noch nichts erhalten? Erneut senden nach {{seconds}} s.',
    error_send_failed:
      'Bestätigungscode konnte nicht gesendet werden. Bitte versuche es später noch einmal.',
    error_verify_failed: 'Verifizierung fehlgeschlagen. Bitte gib den Code erneut ein.',
    error_invalid_code: 'Der Bestätigungscode ist ungültig oder abgelaufen.',
  },
  phone_verification: {
    title: 'Bestätige dein Telefon',
    prepare_description:
      'Bestätige deine Identität, um die Sicherheit deines Kontos zu schützen. Sende den Bestätigungscode an dein Telefon.',
    phone_label: 'Telefonnummer',
    send: 'Bestätigungscode senden',
    description:
      'Der Bestätigungscode wurde an dein Telefon {{phone}} gesendet. Gib den Code ein, um fortzufahren.',
    resend: 'Noch nichts erhalten? <a>Bestätigungscode erneut senden</a>',
    resend_countdown: 'Noch nichts erhalten? Erneut senden nach {{seconds}} s.',
    error_send_failed:
      'Bestätigungscode konnte nicht gesendet werden. Bitte versuche es später noch einmal.',
    error_verify_failed: 'Verifizierung fehlgeschlagen. Bitte gib den Code erneut ein.',
    error_invalid_code: 'Der Bestätigungscode ist ungültig oder abgelaufen.',
  },
  mfa: {
    totp_already_added:
      'Du hast bereits eine Authenticator-App hinzugefügt. Bitte entferne zuerst die vorhandene.',
    totp_not_enabled:
      'Die Authenticator-App OTP ist nicht aktiviert. Bitte kontaktieren Sie Ihren Administrator um Hilfe.',
    backup_code_already_added:
      'Sie haben bereits aktive Backup-Codes. Bitte verwenden oder entfernen Sie diese, bevor Sie neue generieren.',
    backup_code_not_enabled:
      'Backup-Code ist nicht aktiviert. Bitte kontaktieren Sie Ihren Administrator um Hilfe.',
    backup_code_requires_other_mfa:
      'Für Backup-Codes muss zuerst eine andere MFA-Methode eingerichtet werden.',
    passkey_not_enabled:
      'Passkey ist nicht aktiviert. Bitte kontaktieren Sie Ihren Administrator um Hilfe.',
    passkey_already_registered:
      'Dieser Passkey ist bereits in Ihrem Konto registriert. Bitte verwenden Sie einen anderen Authentifikator.',
  },
  update_success: {
    default: {
      title: 'Aktualisiert!',
      description: 'Ihre Informationen wurden aktualisiert.',
    },
    email: {
      title: 'E-Mail aktualisiert!',
      description: 'Ihre E-Mail-Adresse wurde erfolgreich aktualisiert.',
    },
    phone: {
      title: 'Telefonnummer aktualisiert!',
      description: 'Ihre Telefonnummer wurde erfolgreich aktualisiert.',
    },
    username: {
      title: 'Benutzername geändert!',
      description: 'Ihr Benutzername wurde erfolgreich aktualisiert.',
    },
    password: {
      title: 'Passwort geändert!',
      description: 'Ihr Passwort wurde erfolgreich aktualisiert.',
    },
    totp: {
      title: 'Authenticator-App hinzugefügt!',
      description: 'Deine Authenticator-App wurde erfolgreich mit deinem Konto verknüpft.',
    },
    totp_replaced: {
      title: 'Authenticator-App ersetzt!',
      description: 'Ihre Authenticator-App wurde erfolgreich ersetzt.',
    },
    backup_code: {
      title: 'Backup-Codes generiert!',
      description:
        'Ihre Backup-Codes wurden gespeichert. Bewahren Sie sie an einem sicheren Ort auf.',
    },
    passkey: {
      title: 'Passkey hinzugefügt!',
      description: 'Ihr Passkey wurde erfolgreich mit Ihrem Konto verknüpft.',
    },
    social: {
      title: 'Soziales Konto verknüpft!',
      description: 'Ihr soziales Konto wurde erfolgreich verknüpft.',
    },
  },
  backup_code: {
    title: 'Backup-Codes',
    description:
      'Sie können einen dieser Backup-Codes verwenden, um auf Ihr Konto zuzugreifen, wenn Sie bei der 2-Faktor-Authentifizierung Probleme haben. Jeder Code kann nur einmal verwendet werden.',
    copy_hint: 'Kopieren Sie sie und bewahren Sie sie an einem sicheren Ort auf.',
    generate_new_title: 'Neue Backup-Codes generieren',
    generate_new: 'Neue Backup-Codes generieren',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Hinzugefügt: {{date}}',
    last_used: 'Zuletzt verwendet: {{date}}',
    never_used: 'Nie',
    unnamed: 'Unbenannter Passkey',
    renamed: 'Passkey erfolgreich umbenannt.',
    deleted: 'Passkey erfolgreich entfernt.',
    add_another_title: 'Weiteren Passkey hinzufügen',
    add_another_description:
      'Registrieren Sie Ihren Passkey mit Geräte-Biometrie, Sicherheitsschlüsseln (z.B. YubiKey) oder anderen verfügbaren Methoden.',
    add_passkey: 'Passkey hinzufügen',
    delete_confirmation_title: 'Ihren Passkey entfernen',
    delete_confirmation_description:
      'Wenn Sie diesen Passkey entfernen, können Sie ihn nicht mehr zur Verifizierung verwenden.',
    rename_passkey: 'Passkey umbenennen',
    rename_description: 'Geben Sie einen neuen Namen für diesen Passkey ein.',
    name_this_passkey: 'Diesen Geräte-Passkey benennen',
    name_passkey_description:
      'Sie haben dieses Gerät erfolgreich für die 2-Schritt-Authentifizierung verifiziert. Passen Sie den Namen an, um ihn zu erkennen, wenn Sie mehrere Schlüssel haben.',
    name_input_label: 'Name',
  },
};

export default Object.freeze(account_center);
