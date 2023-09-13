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
  webauthn: 'WebAuthn',
  webauthn_description:
    "WebAuthn utilizza la chiave di passaggio per verificare il dispositivo dell'utente, inclusa YubiKey.",
  backup_code: 'Codice di backup',
  backup_code_description:
    'Genera 10 codici unici, ciascuno utilizzabile per una singola autenticazione.',
  backup_code_setup_hint:
    'Il fattore di autenticazione di backup che non può essere attivato da solo:',
  backup_code_error_hint:
    "Per utilizzare il codice di backup per l'autenticazione multi-fattore, è necessario attivare altri fattori per garantire il successo dell'accesso dei tuoi utenti.",
  policy: 'Politica',
  two_step_sign_in_policy: "Politica di autenticazione a due passaggi all'accesso",
  two_step_sign_in_policy_description:
    "Definisci un requisito di autenticazione a due passaggi per l'applicazione al momento dell'accesso.",
  user_controlled: "Controllato dall'utente",
  user_controlled_description:
    'Disabilitato per impostazione predefinita e non obbligatorio, ma gli utenti possono attivarlo singolarmente.',
  mandatory: 'Obbligatorio',
  mandatory_description:
    "Richiedi l'autenticazione multi-fattore per tutti i tuoi utenti ad ogni accesso.",
  unlock_reminder:
    "Sblocca l'autenticazione multi-fattore per verificare la sicurezza passando a un piano a pagamento. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.",
  view_plans: 'Visualizza i piani',
};

export default Object.freeze(mfa);
