import password_rejected from './password-rejected.js';

const error = {
  general_required: `{{types, list(type: disjunction;)}} is required`,
  general_invalid: `The {{types, list(type: disjunction;)}} is invalid`,
  invalid_min_max_input: 'The input value should be between {{minValue}} and {{maxValue}}',
  invalid_min_max_length:
    'The length of the input value should be between {{minLength}} and {{maxLength}}',
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
  invalid_link: 'Invalid link',
  invalid_link_description: 'Your one-time token may have expired or is no longer valid.',
  captcha_verification_failed: 'Failed to perform captcha verification.',
  terms_acceptance_required: 'Terms acceptance required',
  terms_acceptance_required_description:
    'You must agree to the terms to continue. Please try again.',
  something_went_wrong: 'Something went wrong.',
  feature_not_enabled: 'This feature is not enabled.',
};

export default Object.freeze(error);
