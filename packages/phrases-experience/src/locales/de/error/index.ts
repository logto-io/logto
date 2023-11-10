import password_rejected from './password-rejected.js';

const error = {
  general_required: '{{types, list(type: disjunction;)}} ist erforderlich',
  general_invalid: 'Die {{types, list(type: disjunction;)}} is ungültig',
  username_required: 'Benutzername ist erforderlich',
  password_required: 'Passwort ist erforderlich',
  username_exists: 'Benutzername existiert bereits',
  username_should_not_start_with_number: 'Benutzername darf nicht mit einer Zahl beginnen',
  username_invalid_charset: 'Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten',
  invalid_email: 'Die Email ist ungültig',
  invalid_phone: 'Die Telefonnummer ist ungültig',
  passwords_do_not_match: 'Passwörter stimmen nicht überein',
  invalid_passcode: 'Der Bestätigungscode ist ungültig',
  invalid_connector_auth: 'Die Autorisierung ist ungültig',
  invalid_connector_request: 'Connector Daten sind ungültig',
  unknown: 'Unbekannter Fehler. Versuche es später noch einmal.',
  invalid_session: 'Die Sitzung ist ungültig. Bitte melde dich erneut an.',
  timeout: 'Zeitüberschreitung. Bitte melde dich erneut an.',
  password_rejected,
  sso_not_enabled: 'Single Sign-On ist für dieses E-Mail-Konto nicht aktiviert.',
};

export default Object.freeze(error);
