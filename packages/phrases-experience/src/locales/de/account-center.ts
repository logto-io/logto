const account_center = {
  header: {
    title: 'Account Center',
  },
  home: {
    title: 'Seite nicht gefunden',
    description: 'Diese Seite ist nicht verfügbar.',
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
  },
  password_verification: {
    title: 'Passwort bestätigen',
    description:
      'Zum Schutz deines Kontos gib dein Passwort ein, um deine Identität zu bestätigen.',
    error_failed: 'Verifizierung fehlgeschlagen. Bitte überprüfe dein Passwort.',
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
  password: {
    title: 'Passwort festlegen',
    description: 'Erstelle ein neues Passwort, um dein Konto zu schützen.',
    success: 'Passwort erfolgreich aktualisiert.',
  },

  code_verification: {
    send: 'Bestätigungscode senden',
    resend: 'Noch nichts erhalten? <a>Bestätigungscode erneut senden</a>',
    resend_countdown: 'Noch nichts erhalten?<span> Erneut senden nach {{seconds}} s.</span>',
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
    resend_countdown: 'Noch nichts erhalten?<span> Erneut senden nach {{seconds}} s.</span>',
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
    resend_countdown: 'Noch nichts erhalten?<span> Erneut senden nach {{seconds}} s.</span>',
    error_send_failed:
      'Bestätigungscode konnte nicht gesendet werden. Bitte versuche es später noch einmal.',
    error_verify_failed: 'Verifizierung fehlgeschlagen. Bitte gib den Code erneut ein.',
    error_invalid_code: 'Der Bestätigungscode ist ungültig oder abgelaufen.',
  },
  mfa: {
    totp_already_added:
      'Du hast bereits eine Authenticator-App hinzugefügt. Bitte entferne zuerst die vorhandene.',
    totp_not_enabled:
      'Die Authenticator-App ist nicht aktiviert. Bitte kontaktiere deinen Administrator, um sie zu aktivieren.',
    backup_code_already_added:
      'Sie haben bereits aktive Backup-Codes. Bitte verwenden oder entfernen Sie diese, bevor Sie neue generieren.',
    backup_code_not_enabled:
      'Backup-Code ist nicht aktiviert. Bitte wenden Sie sich an Ihren Administrator, um ihn zu aktivieren.',
    backup_code_requires_other_mfa:
      'Für Backup-Codes muss zuerst eine andere MFA-Methode eingerichtet werden.',
    passkey_not_enabled:
      'Passkey ist nicht aktiviert. Bitte kontaktieren Sie Ihren Administrator, um es zu aktivieren.',
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
    backup_code: {
      title: 'Backup-Codes generiert!',
      description:
        'Ihre Backup-Codes wurden gespeichert. Bewahren Sie sie an einem sicheren Ort auf.',
    },
    backup_code_deleted: {
      title: 'Backup-Codes entfernt!',
      description: 'Ihre Backup-Codes wurden von Ihrem Konto entfernt.',
    },
    passkey: {
      title: 'Passkey hinzugefügt!',
      description: 'Ihr Passkey wurde erfolgreich mit Ihrem Konto verknüpft.',
    },
    passkey_deleted: {
      title: 'Passkey entfernt!',
      description: 'Ihr Passkey wurde von Ihrem Konto entfernt.',
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
    delete_confirmation_title: 'Backup-Codes entfernen',
    delete_confirmation_description:
      'Wenn Sie diese Backup-Codes entfernen, können Sie sich nicht mehr damit verifizieren.',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Hinzugefügt: {{date}}',
    last_used: 'Zuletzt verwendet: {{date}}',
    never_used: 'Nie',
    unnamed: 'Unbenannter Passkey',
    renamed: 'Passkey erfolgreich umbenannt.',
    add_another_title: 'Weiteren Passkey hinzufügen',
    add_another_description:
      'Registrieren Sie Ihren Passkey mit Geräte-Biometrie, Sicherheitsschlüsseln (z.B. YubiKey) oder anderen verfügbaren Methoden.',
    add_passkey: 'Passkey hinzufügen',
    delete_confirmation_title: 'Passkey entfernen',
    delete_confirmation_description:
      'Sind Sie sicher, dass Sie "{{name}}" entfernen möchten? Sie können sich danach nicht mehr mit diesem Passkey anmelden.',
    rename_passkey: 'Passkey umbenennen',
    rename_description: 'Geben Sie einen neuen Namen für diesen Passkey ein.',
  },
};

export default Object.freeze(account_center);
