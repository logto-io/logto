import password_rejected from './password-rejected.js';

const error = {
  general_required: `{{types, list(type: disjunction;)}} è richiesto`,
  general_invalid: `Il {{types, list(type: disjunction;)}} non è valido`,
  username_required: 'Username è richiesto',
  password_required: 'La password è richiesta',
  username_exists: 'Username esiste già',
  username_should_not_start_with_number: "L'username non dovrebbe iniziare con un numero",
  username_invalid_charset: "L'username dovrebbe contenere solo lettere, numeri o underscore.",
  invalid_email: "L'email non è valida",
  invalid_phone: 'Il numero di telefono non è valido',
  passwords_do_not_match: 'Le password non corrispondono. Per favore prova di nuovo.',
  invalid_passcode: 'Il codice di verifica non è valido.',
  invalid_connector_auth: "L'autorizzazione è invalida",
  invalid_connector_request: 'I dati del connettore non sono validi',
  unknown: 'Errore sconosciuto. Si prega di riprovare più tardi.',
  invalid_session: 'Sessione non trovata. Si prega di tornare indietro e accedere di nuovo.',
  timeout: 'Timeout della richiesta. Si prega di riprovare più tardi.',
  password_rejected,
  sso_not_enabled: 'Single sign-on non abilitato per questo account email.',
};

export default Object.freeze(error);
