const mfa = {
  totp: "OTP dell'app Autenticatore",
  webauthn: 'Passkey',
  backup_code: 'Codice di backup',
  email_verification_code: 'Codice di verifica email',
  phone_verification_code: 'Codice di verifica SMS',
  link_totp_description: 'Ad esempio, Google Authenticator, ecc.',
  link_webauthn_description: 'Collega il tuo dispositivo o hardware USB',
  link_backup_code_description: 'Genera un codice di backup',
  link_email_verification_code_description: 'Collega il tuo indirizzo email',
  link_email_2fa_description: 'Collega il tuo indirizzo email per la verifica a 2 passaggi',
  link_phone_verification_code_description: 'Collega il tuo numero di telefono',
  link_phone_2fa_description: 'Collega il tuo numero di telefono per la verifica a 2 passaggi',
  verify_totp_description: "Inserisci il codice monouso nell'app",
  verify_webauthn_description: 'Verifica il tuo dispositivo o hardware USB',
  verify_backup_code_description: 'Incolla il codice di backup che hai salvato',
  verify_email_verification_code_description: 'Inserisci il codice inviato alla tua email',
  verify_phone_verification_code_description: 'Inserisci il codice inviato al tuo telefono',
  add_mfa_factors: 'Aggiungi la verifica in due passaggi',
  add_mfa_description:
    'La verifica in due passaggi è abilitata. Seleziona il tuo secondo metodo di verifica per un accesso sicuro.',
  verify_mfa_factors: 'Verifica in due passaggi',
  verify_mfa_description:
    'La verifica in due passaggi è stata abilitata per questo account. Seleziona il secondo modo per verificare la tua identità.',
  add_authenticator_app: 'Aggiungi app di autenticazione',
  step: 'Passo {{step, number}}: {{content}}',
  scan_qr_code: 'Scansiona questo codice QR',
  scan_qr_code_description:
    'Scansiona il seguente codice QR con la tua app di autenticazione, come Google Authenticator, Duo Mobile, Authy, ecc.',
  qr_code_not_available: 'Non è possibile scansionare il codice QR?',
  copy_and_paste_key: 'Copia e incolla la chiave',
  copy_and_paste_key_description:
    'Copia e incolla la seguente chiave nella tua app di autenticazione, come Google Authenticator, Duo Mobile, Authy, ecc.',
  want_to_scan_qr_code: 'Vuoi scansionare il codice QR?',
  enter_one_time_code: 'Inserisci il codice monouso',
  enter_one_time_code_link_description:
    "Inserisci il codice di verifica a 6 cifre generato dall'app di autenticazione.",
  enter_one_time_code_description:
    'La verifica in due passaggi è stata abilitata per questo account. Inserisci il codice monouso mostrato sulla tua app di autenticazione collegata.',
  enter_email_verification_code: 'Inserisci il codice di verifica e‑mail',
  enter_email_verification_code_description:
    'L’autenticazione a due passaggi è abilitata per questo account. Inserisci il codice di verifica e‑mail inviato a {{identifier}}.',
  enter_phone_verification_code: 'Inserisci il codice di verifica SMS',
  enter_phone_verification_code_description:
    'L’autenticazione a due passaggi è abilitata per questo account. Inserisci il codice di verifica SMS inviato a {{identifier}}.',
  link_another_mfa_factor: 'Passa a un altro metodo',
  save_backup_code: 'Salva il codice di backup',
  save_backup_code_description:
    'Puoi utilizzare uno di questi codici di backup per accedere al tuo account in caso di problemi durante la verifica in due passaggi in altri modi. Ogni codice può essere utilizzato solo una volta.',
  backup_code_hint: 'Assicurati di copiarli e salvarli in un luogo sicuro.',
  enter_a_backup_code: 'Inserisci un codice di backup',
  enter_backup_code_description:
    'Inserisci il codice di backup salvato quando è stata abilitata la verifica in due passaggi.',
  create_a_passkey: 'Crea una chiave di accesso',
  create_passkey_description:
    'Registra la tua chiave di accesso utilizzando le biometrie del dispositivo, le chiavi di sicurezza (ad esempio, YubiKey) o altri metodi disponibili.',
  try_another_verification_method: 'Prova un altro metodo di verifica',
  verify_via_passkey: 'Verifica tramite chiave di accesso',
  verify_via_passkey_description:
    "Usa la chiave di accesso per verificare tramite la password o le biometrie del tuo dispositivo, la scansione del codice QR o l'uso di una chiave di sicurezza USB come YubiKey.",
  secret_key_copied: 'Chiave segreta copiata.',
  backup_code_copied: 'Codice di backup copiato.',
  webauthn_not_ready: 'WebAuthn non è ancora pronto. Riprova più tardi.',
  webauthn_not_supported: 'WebAuthn non è supportato in questo browser.',
  webauthn_failed_to_create: 'Impossibile creare. Riprova.',
  webauthn_failed_to_verify: 'Verifica non riuscita. Riprova.',
};

export default Object.freeze(mfa);
