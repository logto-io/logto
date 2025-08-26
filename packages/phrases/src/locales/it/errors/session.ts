const session = {
  not_found: 'Sessione non trovata. Torna indietro e accedi nuovamente.',
  invalid_credentials: 'Account o password non corretti. Controlla le tue credenziali.',
  invalid_sign_in_method: 'Metodo di accesso corrente non disponibile.',
  invalid_connector_id: 'Impossibile trovare un connettore disponibile con ID {{connectorId}}.',
  insufficient_info: 'Informazioni di accesso insufficienti.',
  connector_id_mismatch: "L'ID del connettore non corrisponde con il record della sessione.",
  connector_session_not_found:
    'Sessione del connettore non trovata. Torna indietro e accedi nuovamente.',
  verification_session_not_found:
    'La verifica non è stata completata con successo. Riavvia il processo di verifica e riprova.',
  verification_expired:
    'La connessione è scaduta. Verifica di nuovo per garantire la sicurezza del tuo account.',
  verification_blocked_too_many_attempts:
    'Troppi tentativi in poco tempo. Si prega di riprovare {{relativeTime}}.',
  unauthorized: 'Accedi prima di procedere.',
  unsupported_prompt_name: 'Nome del prompt non supportato.',
  forgot_password_not_enabled: 'Recupero password non abilitato.',
  verification_failed:
    'La verifica non è stata completata con successo. Riavvia il processo di verifica e riprova.',
  connector_validation_session_not_found:
    'Sessione del connettore per la convalida del token non trovata.',
  csrf_token_mismatch: 'Token CSRF non corrisponde.',
  identifier_not_found: 'Identificativo utente non trovato. Torna indietro e accedi nuovamente.',
  interaction_not_found:
    'Sessione di interazione non trovata. Torna indietro e avvia la sessione nuovamente.',
  invalid_interaction_type:
    "Questa operazione non è supportata per l'interazione corrente. Si prega di avviare una nuova sessione.",
  not_supported_for_forgot_password: 'Questa operazione non è supportata per il recupero password.',
  identity_conflict:
    "Rilevato conflitto di identità. Si prega di avviare una nuova sessione per procedere con un'altra identità.",
  identifier_not_verified:
    "L'identificativo fornito {{identifier}} non è stato verificato. Si prega di creare un record di verifica per questo identificativo e completare il processo di verifica.",
  mfa: {
    require_mfa_verification: 'La verifica MFA è richiesta per accedere.',
    mfa_sign_in_only: "MFA è disponibile solo per l'interazione di accesso.",
    pending_info_not_found:
      'Informazioni MFA in sospeso non trovate, si prega di avviare prima MFA.',
    invalid_totp_code: 'Codice TOTP non valido.',
    webauthn_verification_failed: 'Verifica WebAuthn non riuscita.',
    webauthn_verification_not_found: 'Verifica WebAuthn non trovata.',
    bind_mfa_existed: 'MFA esiste già.',
    backup_code_can_not_be_alone: "Il codice di backup non può essere l'unica MFA.",
    backup_code_required: 'Il codice di backup è richiesto.',
    invalid_backup_code: 'Codice di backup non valido.',
    mfa_policy_not_user_controlled: "La politica MFA non è controllata dall'utente.",
    mfa_factor_not_enabled: 'Il fattore MFA non è abilitato.',
    suggest_additional_mfa:
      'Per una protezione maggiore, considera di aggiungere un altro metodo MFA. Puoi saltare questo passaggio e continuare.',
  },
  sso_enabled: "L'accesso singolo è abilitato per questa email. Accedi con SSO.",
  captcha_required: 'È richiesto il Captcha.',
  captcha_failed: 'La verifica del Captcha non è riuscita.',
  email_blocklist: {
    disposable_email_validation_failed: "La validazione dell'indirizzo email non è riuscita.",
    invalid_email: 'Indirizzo email non valido.',
    email_subaddressing_not_allowed: "Non è consentito l'indirizzamento secondario delle email.",
    email_not_allowed:
      'L\'indirizzo email "{{email}}" è ristretto. Si prega di sceglierne un altro.',
  },
  google_one_tap: {
    cookie_mismatch: 'Discrepanza dei cookie di Google One Tap.',
    invalid_id_token: 'Token ID Google non valido.',
    unverified_email: 'Email non verificata.',
  },
};

export default Object.freeze(session);
