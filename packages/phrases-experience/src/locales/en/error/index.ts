import password_rejected from './password-rejected.js';

const error = {
  general_required: `{{types, list(type: disjunction;)}} is required`,
  general_invalid: `The {{types, list(type: disjunction;)}} is invalid`,
  username_required: 'Username is required',
  password_required: 'Password is required',
  username_exists: 'Username already exists',
  username_should_not_start_with_number: 'Username should not start with a number',
  username_invalid_charset: 'Username should only contain letters, numbers, or underscores.',
  invalid_email: 'The email is invalid',
  invalid_phone: 'The phone number is invalid',
  passwords_do_not_match: 'Your passwords don’t match. Please try again.',
  invalid_passcode: 'The verification code is invalid.',
  invalid_connector_auth: 'The authorization is invalid',
  invalid_connector_request: 'The connector data is invalid',
  unknown: 'Unknown error. Please try again later.',
  invalid_session: 'Session not found. Please go back and sign in again.',
  timeout: 'Request timeout. Please try again later.',
  password_rejected,
  sso_not_enabled: 'Single Sign-On is not enabled for this email account.',
};

export default Object.freeze(error);
