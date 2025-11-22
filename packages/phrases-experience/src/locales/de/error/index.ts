import password_rejected from './password-rejected.js';

const error = {
  general_required: '{{types, list(type: disjunction;)}} ist erforderlich',
  general_invalid: 'Die {{types, list(type: disjunction;)}} is ungültig',
  invalid_min_max_input: 'Der Eingabewert sollte zwischen {{minValue}} und {{maxValue}} liegen',
  invalid_min_max_length:
    'Die Länge des Eingabewerts sollte zwischen {{minLength}} und {{maxLength}} liegen',
  username_required: 'Benutzername ist erforderlich',
  password_required: 'Passwort ist erforderlich',
  username_exists: 'Benutzername existiert bereits',
  username_should_not_start_with_number: 'Benutzername darf nicht mit einer Zahl beginnen',
  username_invalid_charset: 'Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten',
  invalid_email: 'Die Email ist ungültig',
  invalid_phone: 'Die Telefonnummer ist ungültig',
  passwords_do_not_match: 'Passwörter stimmen nicht überein',
  invalid_passcode: 'Der Bestätigungscode ist ungültig.',
  invalid_connector_auth: 'Die Autorisierung ist ungültig',
  invalid_connector_request: 'Connector Daten sind ungültig',
  unknown: 'Unbekannter Fehler. Versuche es später noch einmal.',
  invalid_session: 'Die Sitzung ist ungültig. Bitte melde dich erneut an.',
  timeout: 'Zeitüberschreitung. Bitte melde dich erneut an.',
  password_rejected,
  sso_not_enabled: 'Single Sign-On ist für dieses E-Mail-Konto nicht aktiviert.',
  invalid_link: 'Ungültiger Link',
  invalid_link_description:
    'Dein einmaliger Token ist möglicherweise abgelaufen oder nicht mehr gültig.',
  captcha_verification_failed: 'Fehler beim Captcha-Verifizierung.',
  terms_acceptance_required: 'Zustimmung zu den Bedingungen erforderlich',
  terms_acceptance_required_description:
    'Du musst den Bedingungen zustimmen, um fortzufahren. Bitte versuche es erneut.',
  something_went_wrong: 'Etwas ist schiefgegangen.',
  feature_not_enabled: 'Diese Funktion ist nicht aktiviert.',
};

export default Object.freeze(error);
