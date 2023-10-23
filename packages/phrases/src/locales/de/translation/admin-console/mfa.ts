const mfa = {
  title: 'Multi-Faktor-Authentifizierung',
  description:
    'Fügen Sie der Sicherheit Ihres Anmeldeerlebnisses die Multi-Faktor-Authentifizierung hinzu.',
  factors: 'Faktoren',
  multi_factors: 'Multi-Faktoren',
  multi_factors_description:
    'Benutzer müssen einen der aktivierten Faktoren zur zweistufigen Authentifizierung überprüfen.',
  totp: 'Authenticator-App OTP',
  otp_description: 'Verknüpfen Sie Google Authenticator usw., um Einmalpasswörter zu überprüfen.',
  /** UNTRANSLATED */
  webauthn: 'WebAuthn(Passkey)',
  /** UNTRANSLATED */
  webauthn_description:
    'Verify via browser-supported method: biometrics, phone scanning, or security key, etc.',
  /** UNTRANSLATED */
  webauthn_native_tip: 'WebAuthn is not supported for Native applications.',
  /** UNTRANSLATED */
  webauthn_domain_tip:
    'WebAuthn binds public keys to the specific domain. Modifying your service domain will block users from authenticating via existing passkeys.',
  backup_code: 'Backup-Code',
  backup_code_description:
    'Generieren Sie 10 eindeutige Codes, von denen jeder für eine einzige Authentifizierung verwendet werden kann.',
  backup_code_setup_hint:
    'Der Backup-Authentifizierungsfaktor, der nicht alleine aktiviert werden kann:',
  backup_code_error_hint:
    'Um den Backup-Code für MFA zu verwenden, müssen andere Faktoren aktiviert sein, um die erfolgreiche Anmeldung Ihrer Benutzer sicherzustellen.',
  policy: 'Richtlinie',
  two_step_sign_in_policy: 'Zwei-Schritt-Authentifizierungsrichtlinie bei der Anmeldung',
  user_controlled: 'Benutzer haben die Wahl, MFA persönlich zu aktivieren.',
  mandatory: 'Verpflichtendes MFA für alle Benutzer bei jeder Anmeldung.',
  unlock_reminder:
    'Entsperren Sie die MFA zur Sicherheitsüberprüfung durch ein Upgrade auf einen kostenpflichtigen Plan. Zögern Sie nicht, uns zu <a>kontaktieren</a>, wenn Sie Unterstützung benötigen.',
  view_plans: 'Pläne anzeigen',
};

export default Object.freeze(mfa);
