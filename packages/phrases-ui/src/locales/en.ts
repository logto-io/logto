const translation = {
  input: {
    username: 'Username',
    password: 'Password',
    email: 'Email',
    phone_number: 'Phone number',
    confirm_password: 'Confirm password',
  },
  secondary: {
    sign_in_with: 'Sign in with {{methods, list(type: disjunction;)}}',
    social_bind_with:
      'Already have an account? Sign in to bind {{methods, list(type: disjunction;)}} with your social identity.',
  },
  action: {
    sign_in: 'Sign In',
    continue: 'Continue',
    create_account: 'Create Account',
    create: 'Create',
    enter_passcode: 'Enter Passcode',
    confirm: 'Confirm',
    cancel: 'Cancel',
    bind: 'Binding with {{address}}',
    back: 'Go Back',
    nav_back: 'Back',
    agree: 'Agree',
    got_it: 'Got it',
    sign_in_with: 'Sign in with {{name}}',
  },
  description: {
    email: 'email',
    phone: 'phone',
    phone_number: 'phone number',
    reminder: 'Reminder',
    not_found: '404 Not Found',
    agree_with_terms: 'I have read and agree to the ',
    agree_with_terms_modal: 'Please read the {{terms}} and then agree the box first.',
    terms_of_use: 'Terms of Use',
    create_account: 'Create Account',
    forgot_password: 'Forgot Password?',
    or: 'or',
    enter_passcode: 'The passcode has been sent to your {{address}}',
    passcode_sent: 'The passcode has been resent',
    resend_after_seconds: 'Resend after {{seconds}} seconds',
    resend_passcode: 'Resend Passcode',
    continue_with: 'Continue with',
    create_account_id_exists:
      'The account with {{type}} {{value}} already exists, would you like to sign in?',
    sign_in_id_does_not_exists:
      'The account with {{type}} {{value}} does not exist, would you like to create a new account?',
    bind_account_title: 'Binding Logto account',
    social_create_account: 'No account? You can create a new account and bind.',
    social_bind_account: 'Already have an account? Sign in to bind it with your social identity.',
    social_bind_with_existing: 'We find a related account, you can bind it directly.',
  },
  error: {
    username_password_mismatch: 'Username and password do not match.',
    username_required: 'Username is required.',
    password_required: 'Password is required.',
    username_exists: 'Username already exists.',
    username_should_not_start_with_number: 'Username should not start with a number.',
    username_valid_charset: 'Username should only contain letters, numbers, or underscore.',
    invalid_email: 'The email is invalid',
    invalid_phone: 'The phone number is invalid',
    password_min_length: 'Password requires a minimum of {{min}} characters.',
    passwords_do_not_match: 'Passwords do not match.',
    agree_terms_required: 'You must agree to the Terms of Use before continuing.',
    invalid_passcode: 'The passcode is invalid.',
    invalid_connector_auth: 'The authorization is invalid.',
    invalid_connector_request: 'The connector data is invalid.',
    unknown: 'Unknown error, please try again later.',
    invalid_session: 'Session not found. Please go back and sign in again.',
  },
};

const en = Object.freeze({
  translation,
});

export default en;
