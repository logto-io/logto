const mfa = {
  totp: 'Authenticator-App OTP',
  webauthn: 'Passwort-Schlüssel',
  backup_code: 'Backup-Code',
  link_totp_description: 'Verknüpfen Sie Google Authenticator usw',
  link_webauthn_description: 'Verknüpfen Sie Ihr Gerät oder USB-Hardware',
  link_backup_code_description: 'Backup-Code generieren',
  verify_totp_description: 'Geben Sie den einmaligen Code in der App ein',
  verify_webauthn_description: 'Verifizieren Sie Ihr Gerät oder USB-Hardware',
  verify_backup_code_description: 'Fügen Sie den gespeicherten Backup-Code ein',
  add_mfa_factors: '2-Stufen-Authentifizierung hinzufügen',
  add_mfa_description:
    'Die Zwei-Faktor-Authentifizierung ist aktiviert. Wählen Sie Ihre zweite Verifizierungsmethode für sichere Anmeldung an.',
  verify_mfa_factors: '2-Stufen-Authentifizierung',
  verify_mfa_description:
    'Für dieses Konto wurde die 2-Stufen-Authentifizierung aktiviert. Bitte wählen Sie die zweite Methode zur Verifizierung Ihrer Identität.',
  add_authenticator_app: 'Authenticator-App hinzufügen',
  step: 'Schritt {{step, number}}: {{content}}',
  scan_qr_code: 'Scannen Sie diesen QR-Code',
  scan_qr_code_description:
    'Scannen Sie diesen QR-Code mit Ihrer Authenticator-App, wie Google Authenticator, Duo Mobile, Authy, usw.',
  qr_code_not_available: 'QR-Code nicht verfügbar?',
  copy_and_paste_key: 'Schlüssel kopieren und einfügen',
  copy_and_paste_key_description:
    'Fügen Sie diesen Schlüssel in Ihre Authenticator-App ein, wie Google Authenticator, Duo Mobile, Authy, usw.',
  want_to_scan_qr_code: 'Möchten Sie den QR-Code scannen?',
  enter_one_time_code: 'Einmaligen Code eingeben',
  enter_one_time_code_link_description:
    'Geben Sie den 6-stelligen Verifizierungscode ein, der von der Authenticator-App generiert wurde.',
  enter_one_time_code_description:
    'Für dieses Konto wurde die 2-Stufen-Authentifizierung aktiviert. Bitte geben Sie den einmaligen Code ein, der in Ihrer verknüpften Authenticator-App angezeigt wird.',
  link_another_mfa_factor: 'Weitere 2-Stufen-Authentifizierung verknüpfen',
  save_backup_code: 'Backup-Code speichern',
  save_backup_code_description:
    'Sie können einen dieser Backup-Codes verwenden, um auf Ihr Konto zuzugreifen, wenn Sie Probleme bei der 2-Stufen-Authentifizierung auf andere Weise haben. Jeder Code kann nur einmal verwendet werden.',
  backup_code_hint:
    'Stellen Sie sicher, dass Sie sie kopieren und an einem sicheren Ort aufbewahren.',
  enter_backup_code_description:
    'Geben Sie den Backup-Code ein, den Sie gespeichert haben, als die 2-Stufen-Authentifizierung ursprünglich aktiviert wurde.',
  create_a_passkey: 'Passwort-Schlüssel erstellen',
  create_passkey_description:
    'Registrieren Sie einen Passwort-Schlüssel zur Verifizierung über Ihr Gerätepasswort oder Biometrie, scannen Sie den QR-Code oder verwenden Sie eine USB-Sicherheitsschlüssel wie YubiKey.',
  name_your_passkey: 'Benennen Sie Ihren Passwort-Schlüssel',
  name_passkey_description:
    'Sie haben dieses Gerät erfolgreich für die 2-Stufen-Authentifizierung verifiziert. Passen Sie den Namen an, um ihn bei mehreren Schlüsseln zu erkennen.',
  try_another_verification_method: 'Versuchen Sie eine andere Verifizierungsmethode',
  verify_via_passkey: 'Über Passwort-Schlüssel verifizieren',
  verify_via_passkey_description:
    'Verwenden Sie den Passwort-Schlüssel zur Verifizierung über Ihr Gerätepasswort oder Biometrie, scannen Sie den QR-Code oder verwenden Sie eine USB-Sicherheitsschlüssel wie YubiKey.',
  secret_key_copied: 'Geheimer Schlüssel kopiert.',
  backup_code_copied: 'Sicherungscode kopiert.',
};

export default Object.freeze(mfa);
