const mfa = {
  title: 'Autenticazione multi-fattore',
  description:
    "Aggiungi l'autenticazione multi-fattore per aumentare la sicurezza della tua esperienza di accesso.",
  factors: 'Fattori',
  multi_factors: 'Multi-fattori',
  multi_factors_description:
    "Gli utenti devono verificare uno dei fattori abilitati per l'autenticazione a due passaggi.",
  totp: "OTP dell'app Authenticator",
  otp_description: 'Collega Google Authenticator, ecc., per verificare le password monouso.',
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
  backup_code: 'Codice di backup',
  backup_code_description:
    'Genera 10 codici unici, ciascuno utilizzabile per una singola autenticazione.',
  backup_code_setup_hint:
    'Il fattore di autenticazione di backup che non può essere attivato da solo:',
  backup_code_error_hint:
    "Per utilizzare il codice di backup per l'autenticazione multi-fattore, è necessario attivare altri fattori per garantire il successo dell'accesso dei tuoi utenti.",
  policy: 'Politica',
  two_step_sign_in_policy: "Politica di autenticazione a due passaggi all'accesso",
  user_controlled: 'Gli utenti hanno la possibilità di abilitare personalmente la MFA.',
  mandatory: 'MFA obbligatorio per tutti gli utenti ad ogni accesso.',
  unlock_reminder:
    "Sblocca l'autenticazione multi-fattore per verificare la sicurezza passando a un piano a pagamento. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.",
  view_plans: 'Visualizza i piani',
};

export default Object.freeze(mfa);
