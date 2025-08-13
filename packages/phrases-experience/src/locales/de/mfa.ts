const mfa = {
  totp: 'Authenticator-App-OTP',
  webauthn: 'Passkey',
  backup_code: 'Backup-Code',
  email_verification_code: 'E-Mail-Verifizierungscode',
  phone_verification_code: 'SMS-Verifizierungscode',
  link_totp_description: 'z.B. Google Authenticator usw.',
  link_webauthn_description: 'Verknüpfen Sie Ihr Gerät oder USB-Hardware',
  link_backup_code_description: 'Backup-Code generieren',
  link_email_verification_code_description: 'Verknüpfen Sie Ihre E-Mail-Adresse',
  link_email_2fa_description: 'Verknüpfen Sie Ihre E-Mail-Adresse für 2-Schritt-Verifizierung',
  link_phone_verification_code_description: 'Verknüpfen Sie Ihre Telefonnummer',
  link_phone_2fa_description: 'Verknüpfen Sie Ihre Telefonnummer für 2-Schritt-Verifizierung',
  verify_totp_description: 'Geben Sie den Einmalcode in der App ein',
  verify_webauthn_description: 'Verifizieren Sie Ihr Gerät oder Ihre USB-Hardware',
  verify_backup_code_description: 'Fügen Sie den gespeicherten Backup-Code ein',
  verify_email_verification_code_description: 'Geben Sie den an Ihre E-Mail gesendeten Code ein',
  verify_phone_verification_code_description: 'Geben Sie den an Ihr Telefon gesendeten Code ein',
  add_mfa_factors: '2-Schritte-Verifizierung hinzufügen',
  add_mfa_description:
    'Die Zwei-Faktor-Verifizierung ist aktiviert. Wählen Sie Ihre zweite Verifizierungsmethode für sicheres Anmelden aus.',
  verify_mfa_factors: '2-Schritte-Verifizierung',
  verify_mfa_description:
    'Die 2-Schritte-Verifizierung ist für dieses Konto aktiviert. Bitte wählen Sie die zweite Methode zur Verifizierung Ihrer Identität aus.',
  add_authenticator_app: 'Authenticator-App hinzufügen',
  step: 'Schritt {{step, number}}: {{content}}',
  scan_qr_code: 'Scannen Sie diesen QR-Code',
  scan_qr_code_description:
    'Scannen Sie den folgenden QR-Code mit Ihrer Authenticator-App, wie z.B. Google Authenticator, Duo Mobile, Authy usw.',
  qr_code_not_available: 'Kann den QR-Code nicht scannen?',
  copy_and_paste_key: 'Schlüssel kopieren und einfügen',
  copy_and_paste_key_description:
    'Kopieren Sie den folgenden Schlüssel und fügen Sie ihn in Ihre Authenticator-App ein, wie z.B. Google Authenticator, Duo Mobile, Authy usw.',
  want_to_scan_qr_code: 'Möchten Sie den QR-Code scannen?',
  enter_one_time_code: 'Einmalcode eingeben',
  enter_one_time_code_link_description:
    'Geben Sie den 6-stelligen Verifizierungscode ein, der von der Authenticator-App generiert wurde.',
  enter_one_time_code_description:
    'Für dieses Konto wurde die Zwei-Faktor-Authentifizierung aktiviert. Bitte geben Sie den einmaligen Code ein, der in Ihrer verknüpften Authentifizierungs-App angezeigt wird.',
  link_another_mfa_factor: 'Zu einer anderen Methode wechseln',
  save_backup_code: 'Backup-Code speichern',
  save_backup_code_description:
    'Sie können einen dieser Backup-Codes verwenden, um auf Ihr Konto zuzugreifen, wenn Sie während der 2-Schritte-Verifizierung auf andere Weise Probleme haben. Jeder Code kann nur einmal verwendet werden.',
  backup_code_hint:
    'Stellen Sie sicher, dass Sie sie kopieren und an einem sicheren Ort speichern.',
  enter_a_backup_code: 'Backup-Code eingeben',
  enter_backup_code_description:
    'Geben Sie den Backup-Code ein, den Sie gespeichert haben, als die 2-Schritte-Verifizierung initial aktiviert wurde.',
  create_a_passkey: 'Passkey erstellen',
  create_passkey_description:
    'Registrieren Sie Ihren Passkey mit biometrischen Daten, Sicherheitsschlüsseln (z.B. YubiKey) oder anderen verfügbaren Methoden.',
  try_another_verification_method: 'Versuchen Sie eine andere Methode zur Verifizierung',
  verify_via_passkey: 'Über Passkey verifizieren',
  verify_via_passkey_description:
    'Verwenden Sie den Passkey zur Verifizierung durch Ihr Gerätepasswort oder Biometrie, zum Scannen des QR-Codes oder zum Verwenden eines USB-Sicherheitsschlüssels wie YubiKey.',
  secret_key_copied: 'Geheimer Schlüssel kopiert.',
  backup_code_copied: 'Backup-Code kopiert.',
  webauthn_not_ready: 'WebAuthn ist noch nicht bereit. Bitte versuchen Sie es später erneut.',
  webauthn_not_supported: 'WebAuthn wird in diesem Browser nicht unterstützt.',
  webauthn_failed_to_create: 'Erstellung fehlgeschlagen. Bitte versuchen Sie es erneut.',
  webauthn_failed_to_verify: 'Verifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.',
};

export default Object.freeze(mfa);
