const mfa = {
  totp: "OTP dell'applicazione autenticatore",
  webauthn: 'Chiave di accesso',
  backup_code: 'Codice di backup',
  link_totp_description: 'Collega Google Authenticator, ecc.',
  link_webauthn_description: 'Collega il tuo dispositivo o hardware USB',
  link_backup_code_description: 'Genera un codice di backup',
  verify_totp_description: "Inserisci il codice monouso nell'app",
  verify_webauthn_description: 'Verifica il tuo dispositivo o hardware USB',
  verify_backup_code_description: 'Incolla il codice di backup che hai salvato',
  add_mfa_factors: 'Aggiungi autenticazione a due fattori',
  add_mfa_description:
    "L'autenticazione a due fattori è attiva. Scegli il tuo secondo metodo di verifica per accedere in modo sicuro al tuo account.",
  verify_mfa_factors: 'Autenticazione a due fattori',
  verify_mfa_description:
    "È stata attivata l'autenticazione a due fattori per questo account. Scegli il secondo modo per verificare la tua identità.",
  add_authenticator_app: 'Aggiungi app autenticatore',
  step: 'Passo {{step, number}}: {{content}}',
  scan_qr_code: 'Scansiona questo codice QR',
  scan_qr_code_description:
    'Scansiona con la tua app autenticatore, come Google Authenticator, Duo Mobile, Authy, ecc.',
  qr_code_not_available: 'Non riesci a scansionare il codice QR?',
  copy_and_paste_key: 'Copia e incolla la chiave',
  copy_and_paste_key_description:
    'Incolla la chiave di seguito nella tua app autenticatore, come Google Authenticator, Duo Mobile, Authy, ecc.',
  want_to_scan_qr_code: 'Vuoi scansionare il codice QR?',
  enter_one_time_code: 'Inserisci il codice monouso',
  enter_one_time_code_link_description:
    "Inserisci il codice di verifica a 6 cifre generato dall'app autenticatore.",
  enter_one_time_code_description:
    "È stata attivata l'autenticazione a due fattori per questo account. Inserisci il codice monouso visualizzato nella tua app autenticatore collegata.",
  link_another_mfa_factor: 'Collega un altro metodo di autenticazione a due fattori',
  save_backup_code: 'Salva il codice di backup',
  save_backup_code_description:
    "Puoi usare uno di questi codici di backup per accedere al tuo account se incontri problemi durante l'autenticazione a due fattori in altri modi. Ogni codice può essere utilizzato solo una volta.",
  backup_code_hint: 'Assicurati di copiarli e salvarli in un luogo sicuro.',
  enter_backup_code_description:
    "Inserisci il codice di backup che hai salvato quando è stata attivata l'autenticazione a due fattori.",
  create_a_passkey: 'Crea una chiave di accesso',
  create_passkey_description:
    "Registra una chiave di accesso per verificarti tramite la password del dispositivo o la biometria, la scansione del codice QR o l'uso di una chiave di sicurezza USB come YubiKey.",
  name_your_passkey: 'Dai un nome alla tua chiave di accesso',
  name_passkey_description:
    "Hai verificato con successo questo dispositivo per l'autenticazione a due fattori. Personalizza il nome per riconoscerlo se hai più chiavi.",
  try_another_verification_method: 'Prova un altro metodo di verifica',
  verify_via_passkey: 'Verifica tramite chiave di accesso',
  verify_via_passkey_description:
    "Usa la chiave di accesso per verificarti tramite la password del dispositivo o la biometria, la scansione del codice QR o l'uso di una chiave di sicurezza USB come YubiKey.",
  secret_key_copied: 'Chiave segreta copiata.',
  backup_code_copied: 'Codice di backup copiato.',
};

export default Object.freeze(mfa);
