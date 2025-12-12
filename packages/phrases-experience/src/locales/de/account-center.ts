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
    title: 'Telefon verknüpfen',
    description:
      'Verknüpfe deine Telefonnummer, um dich anzumelden oder die Kontowiederherstellung zu unterstützen.',
    verification_title: 'Telefon-Bestätigungscode eingeben',
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
    resend: 'Code erneut senden',
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
    resend: 'Code erneut senden',
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
    resend: 'Code erneut senden',
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
      'Die Authenticator-App ist nicht aktiviert. Bitte kontaktiere deinen Administrator, um sie zu aktivieren.',
  },
  update_success: {
    default: {
      title: 'Aktualisierung erfolgreich',
      description: 'Deine Änderungen wurden erfolgreich gespeichert.',
    },
    email: {
      title: 'E-Mail-Adresse aktualisiert!',
      description: 'Die E-Mail-Adresse deines Kontos wurde erfolgreich geändert.',
    },
    phone: {
      title: 'Telefonnummer aktualisiert!',
      description: 'Die Telefonnummer deines Kontos wurde erfolgreich geändert.',
    },
    username: {
      title: 'Benutzername aktualisiert!',
      description: 'Der Benutzername deines Kontos wurde erfolgreich geändert.',
    },

    password: {
      title: 'Passwort aktualisiert!',
      description: 'Das Passwort deines Kontos wurde erfolgreich geändert.',
    },
    totp: {
      title: 'Authenticator-App hinzugefügt!',
      description: 'Deine Authenticator-App wurde erfolgreich mit deinem Konto verknüpft.',
    },
  },
};

export default Object.freeze(account_center);
