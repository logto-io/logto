const mfa = {
  title: 'Zwei-Faktor-Authentifizierung',
  description:
    'Fügen Sie der Sicherheit Ihrer Anmeldeerfahrung die Zwei-Faktor-Authentifizierung hinzu.',
  factors: 'Faktoren',
  multi_factors: 'Multi-Faktoren',
  multi_factors_description:
    'Benutzer müssen einen der aktivierten Faktoren für die Zwei-Schritt-Verifizierung überprüfen.',
  totp: 'Authenticator-App OTP',
  otp_description: 'Verknüpfen Sie Google Authenticator usw., um Einmalpasswörter zu überprüfen.',
  webauthn: 'WebAuthn (Passwort)',
  webauthn_description:
    'Überprüfen Sie über browserunterstützte Methoden: Biometrie, Handy-Scan oder Sicherheitsschlüssel usw.',
  webauthn_native_tip: 'WebAuthn wird für native Anwendungen nicht unterstützt.',
  webauthn_domain_tip:
    'WebAuthn bindet öffentliche Schlüssel an die spezifische Domain. Das Ändern Ihrer Servicedomain blockiert Benutzer daran, sich über vorhandene Passwörter zu authentifizieren.',
  backup_code: 'Backup-Code',
  backup_code_description:
    'Generieren Sie nach Einrichtung einer beliebigen MFA-Methode 10 einmalige Backup-Codes.',
  backup_code_setup_hint:
    'Wenn Benutzer die obigen MFA-Faktoren nicht überprüfen können, verwenden Sie die Backup-Option.',
  backup_code_error_hint:
    'Um einen Backup-Code zu verwenden, benötigen Sie mindestens eine weitere MFA-Methode für eine erfolgreiche Benutzerauthentifizierung.',
  policy: 'Richtlinie',
  policy_description: 'Legen Sie die MFA-Richtlinie für Anmelde- und Anmeldevorgänge fest.',
  two_step_sign_in_policy: 'Zwei-Schritt-Verifizierungspolitik bei der Anmeldung',
  user_controlled: 'Benutzer können MFA selbst aktivieren oder deaktivieren',
  user_controlled_tip:
    'Benutzer können die MFA-Einrichtung beim ersten Mal bei der Anmeldung oder Anmeldung überspringen oder sie in den Kontoeinstellungen aktivieren/deaktivieren.',
  mandatory: 'Benutzer müssen immer MFA bei der Anmeldung verwenden',
  mandatory_tip:
    'Benutzer müssen MFA beim ersten Mal bei der Anmeldung oder Anmeldung einrichten und es für alle zukünftigen Anmeldungen verwenden.',
};

export default Object.freeze(mfa);
