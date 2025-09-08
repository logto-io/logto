const mfa = {
  title: 'Autenticazione a più fattori',
  description:
    "Aggiungi l'autenticazione a più fattori per elevare la sicurezza della tua esperienza di accesso.",
  factors: 'Fattori',
  multi_factors: 'Multi-fattori',
  multi_factors_description:
    'Gli utenti devono verificare uno dei fattori abilitati per la verifica a due passaggi.',
  totp: "OTP dell'app autenticatore",
  otp_description: 'Collega Google Authenticator, ecc., per verificare le password monouso.',
  webauthn: 'WebAuthn (Passkey)',
  webauthn_description:
    'Verifica tramite un metodo supportato dal browser: biometria, scansione del telefono o chiave di sicurezza, ecc.',
  webauthn_native_tip: 'WebAuthn non è supportato per le applicazioni native.',
  webauthn_domain_tip:
    'WebAuthn lega le chiavi pubbliche al dominio specifico. Modificare il dominio del servizio impedirà agli utenti di autenticarsi tramite le passkey esistenti.',
  backup_code: 'Codice di backup',
  backup_code_description:
    'Genera 10 codici di backup monouso dopo che gli utenti hanno configurato qualsiasi metodo MFA.',
  backup_code_setup_hint:
    "Quando gli utenti non possono verificare i suddetti fattori MFA, utilizzare l'opzione di backup.",
  backup_code_error_hint:
    "Per utilizzare un codice di backup, è necessario almeno un altro metodo MFA per un'autenticazione utente riuscita.",
  email_verification_code: 'Codice di verifica email',
  email_verification_code_description:
    "Collega l'indirizzo email per ricevere e verificare i codici di verifica.",
  phone_verification_code: 'Codice di verifica SMS',
  phone_verification_code_description:
    'Collega il numero di telefono per ricevere e verificare i codici di verifica SMS.',
  policy: 'Politica',
  policy_description: 'Imposta la politica MFA per i flussi di accesso e registrazione.',
  two_step_sign_in_policy: "Politica di verifica a due passaggi all'accesso",
  user_controlled: 'Gli utenti possono abilitare o disabilitare MFA autonomamente',
  user_controlled_tip:
    "Gli utenti possono saltare la configurazione MFA la prima volta all'accesso o alla registrazione, o abilitarla/disabilitarla nelle impostazioni dell'account.",
  mandatory: "Gli utenti devono sempre utilizzare MFA all'accesso",
  mandatory_tip:
    "Gli utenti devono configurare MFA la prima volta all'accesso o alla registrazione, e usarlo per tutti gli accessi futuri.",
  require_mfa: 'Richiedi MFA',
  require_mfa_label:
    'Abilitalo per rendere obbligatoria la verifica in due passaggi per accedere alle tue applicazioni. Se disabilitato, gli utenti possono decidere se abilitare MFA per se stessi.',
  set_up_prompt: 'Messaggio di configurazione MFA',
  no_prompt: 'Non chiedere agli utenti di configurare MFA',
  prompt_at_sign_in_and_sign_up:
    'Chiedi agli utenti di configurare MFA durante la registrazione (facoltativo, messaggio unico)',
  prompt_only_at_sign_in:
    'Chiedi agli utenti di configurare MFA al loro prossimo tentativo di accesso dopo la registrazione (facoltativo, messaggio unico)',
  set_up_organization_required_mfa_prompt:
    "Messaggio di configurazione MFA per gli utenti dopo che l'organizzazione abilita MFA",
  prompt_at_sign_in_no_skip:
    'Chiedi agli utenti di configurare MFA al prossimo accesso (senza possibilità di saltare)',
  email_primary_method_tip:
    'Il codice di verifica email è già il tuo metodo principale di accesso. Per mantenere la sicurezza, non può essere riutilizzato per la MFA.',
  phone_primary_method_tip:
    'Il codice di verifica SMS è già il tuo metodo principale di accesso. Per mantenere la sicurezza, non può essere riutilizzato per la MFA.',
  no_email_connector_warning:
    'Nessun connettore email è ancora stato configurato. Prima di completare la configurazione, gli utenti non potranno utilizzare i codici di verifica email per MFA. <a>{{link}}</a> in "Connettori".',
  no_sms_connector_warning:
    'Nessun connettore SMS è ancora stato configurato. Prima di completare la configurazione, gli utenti non potranno utilizzare i codici di verifica SMS per MFA. <a>{{link}}</a> in "Connettori".',
  no_email_connector_error:
    'Impossibile abilitare MFA con codice di verifica email senza un connettore email. Si prega di configurare prima un connettore email.',
  no_sms_connector_error:
    'Impossibile abilitare MFA con codice di verifica SMS senza un connettore SMS. Si prega di configurare prima un connettore SMS.',
  setup_link: 'Configura',
};

export default Object.freeze(mfa);
