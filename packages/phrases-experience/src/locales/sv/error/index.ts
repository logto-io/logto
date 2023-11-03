import password_rejected from './password-rejected.js';

const error = {
  general_required: `{{types, list(type: disjunction;)}} krävs`,
  general_invalid: `The {{types, list(type: disjunction;)}} är ogiltigt`,
  username_required: 'Användarnamn saknas',
  password_required: 'Lösenord saknas',
  username_exists: 'Användarnamnet är upptaget',
  username_should_not_start_with_number: 'Användarnamn får inte börja med siffror',
  username_invalid_charset: 'Användarnamn får bara innehålla bokstäver, siffror och understreck.',
  invalid_email: 'E-posten är inte giltig',
  invalid_phone: 'Telefonnumret är inte giltigt',
  passwords_do_not_match: 'Lösenorden överensstämmer inte',
  invalid_passcode: 'Ogiltig verifieringskod',
  invalid_connector_auth: 'Ogiltig autentisering',
  invalid_connector_request: 'Ogiltig anslutningsdata',
  unknown: 'Okänt fel. Försök igen senare.',
  invalid_session: 'Ingen session hittad. Backa och försök igen.',
  timeout: 'Begäran tog för lång tid. Försök igen senare',
  password_rejected,
};

export default Object.freeze(error);
