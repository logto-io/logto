import type { LocalePhrase } from '../types.js';

const translation = {
  input: {
    username: 'Benutzername',
    password: 'Passwort',
    email: 'Email',
    phone_number: 'Telefonnummer',
    confirm_password: 'Passwort bestätigen',
  },
  secondary: {
    sign_in_with: 'Anmelden mit {{methods, list(type: disjunction;)}}',
    register_with: 'Create account with {{methods, list(type: disjunction;)}}', // UNTRANSLATED
    social_bind_with:
      'Besitzt du schon ein Konto? Melde dich an, um {{methods, list(type: disjunction;)}} mit deiner Identität zu verbinden.',
  },
  action: {
    sign_in: 'Anmelden',
    continue: 'Weiter',
    create_account: 'Konto erstellen',
    create: 'Erstellen',
    enter_passcode: 'Bestätigungscode eingeben',
    confirm: 'Bestätigen',
    cancel: 'Abbrechen',
    save_password: 'Speichern',
    bind: 'Mit {{address}} verknüpfen',
    bind_and_continue: 'Link and continue', // UNTRANSLATED
    back: 'Gehe zurück',
    nav_back: 'Zurück',
    agree: 'Zustimmen',
    got_it: 'Alles klar',
    sign_in_with: 'Mit {{name}} anmelden',
    forgot_password: 'Passwort vergessen?',
    switch_to: 'Zu {{method}} wechseln',
    sign_in_via_passcode: 'Sign in with verification code', // UNTRANSLATED
    sign_in_via_password: 'Sign in with password', // UNTRANSLATED
    change: 'Change {{method}}', // UNTRANSLATED
    link_another_email: 'Link another email', // UNTRANSLATED
    link_another_phone: 'Link another phone', // UNTRANSLATED
    link_another_email_or_phone: 'Link another email or phone', // UNTRANSLATED
  },
  description: {
    email: 'Email',
    phone_number: 'Telefonnummer',
    reminder: 'Erinnerung',
    not_found: '404 Nicht gefunden',
    agree_with_terms: 'Ich akzeptiere die ',
    agree_with_terms_modal: 'Bitte akzeptiere die <link></link>.',
    terms_of_use: 'Nutzungsbedingungen',
    create_account: 'Konto erstellen',
    or: 'oder',
    enter_passcode: 'Der Bestätigungscode wurde an deine {{address}} gesendet',
    passcode_sent: 'Der Bestätigungscode wurde erneut gesendet',
    resend_after_seconds: 'Nach <span>{{seconds}}</span> Sekunden erneut senden',
    resend_passcode: 'Bestätigungscode erneut senden',
    create_account_id_exists:
      'Das Konto mit {{type}} {{value}} existiert bereits, möchtest du dich anmelden?',
    link_account_id_exists:
      'The account with {{type}} {{value}} already exists, would you like to link?', // UNTRANSLATED
    sign_in_id_does_not_exist:
      'Das Konto mit {{type}} {{value}} existiert nicht, möchtest du ein neues Konto erstellen?',
    sign_in_id_does_not_exist_alert: 'The account with {{type}} {{value}} does not exist.', // UNTRANSLATED
    create_account_id_exists_alert: 'The account with {{type}} {{value}} already exists', // UNTRANSLATED
    social_identity_exist:
      'The {{type}} {{value}} is linked to another account. Please try another {{type}}', // UNTRANSLATED
    bind_account_title: 'Link or create account', // UNTRANSLATED
    social_create_account: 'Kein Konto? Du kannst ein neues Konto erstellen und es verknüpfen.',
    social_link_email: 'You can link another email', // UNTRANSLATED,
    social_link_phone: 'You can link another phone', // UNTRANSLATED,
    social_link_email_or_phone: 'You can link another email or phone', // UNTRANSLATED,
    social_bind_with_existing: 'Wir haben ein Konto gefunden, das du verknüpfen kannst.',
    reset_password: 'Passwort zurücksetzen',
    reset_password_description_email:
      'Gib die Email Adresse deines Kontos ein und wir senden dir einen Bestätigungscode um dein Passwort zurückzusetzen.',
    reset_password_description_phone:
      'Gib die Telefonnummer deines Kontos ein und wir senden dir einen Bestätigungscode um dein Passwort zurückzusetzen.',
    new_password: 'Neues Passwort',
    set_password: 'Set password', // UNTRANSLATED
    password_changed: 'Passwort geändert',
    no_account: 'No account yet? ', // UNTRANSLATED
    have_account: 'Already had an account?', // UNTRANSLATED
    enter_password: 'Enter Password', // UNTRANSLATED
    enter_password_for: 'Sign in with the password to {{method}} {{value}}', // UNTRANSLATED
    enter_username: 'Set username', // UNTRANSLATED
    enter_username_description:
      'Username is an alternative for sign-in. Username must contain only letters, numbers, and underscores.', // UNTRANSLATED
    link_email: 'Link email', // UNTRANSLATED
    link_phone: 'Link phone', // UNTRANSLATED
    link_email_or_phone: 'Link email or phone', // UNTRANSLATED
    link_email_description: 'For added security, please link your email with the account.', // UNTRANSLATED
    link_phone_description: 'For added security, please link your phone with the account.', // UNTRANSLATED
    link_email_or_phone_description:
      'For added security, please link your email or phone with the account.', // UNTRANSLATED
    continue_with_more_information: 'For added security, please complete below account details.', // UNTRANSLATED
  },
  profile: {
    title: 'Account Settings', // UNTRANSLATED
    description:
      'Change your account settings and manage your personal information here to ensure your account security.', // UNTRANSLATED
    settings: {
      title: 'PROFILE SETTINGS', // UNTRANSLATED
      profile_information: 'Profile Information', // UNTRANSLATED
      avatar: 'Avatar', // UNTRANSLATED
      name: 'Name', // UNTRANSLATED
      username: 'Username', // UNTRANSLATED
    },
    password: {
      title: 'PASSWORD', // UNTRANSLATED
      reset_password: 'Reset Password', // UNTRANSLATED
      reset_password_sc: 'Reset password', // UNTRANSLATED
    },
    link_account: {
      title: 'LINK ACCOUNT', // UNTRANSLATED
      email_phone_sign_in: 'Email / Phone Sign-In', // UNTRANSLATED
      email: 'Email', // UNTRANSLATED
      phone: 'Phone', // UNTRANSLATED
      phone_sc: 'Phone number', // UNTRANSLATED
      social: 'Social Sign-In', // UNTRANSLATED
      social_sc: 'Social accounts', // UNTRANSLATED
    },
    not_set: 'Not set', // UNTRANSLATED
    edit: 'Edit', // UNTRANSLATED
    change: 'Change', // UNTRANSLATED
    link: 'Link', // UNTRANSLATED
    unlink: 'Unlink', // UNTRANSLATED
  },
  error: {
    username_password_mismatch: 'Benutzername oder Passwort ist falsch',
    username_required: 'Benutzername ist erforderlich',
    password_required: 'Passwort ist erforderlich',
    username_exists: 'Benutzername existiert bereits',
    username_should_not_start_with_number: 'Benutzername darf nicht mit einer Zahl beginnen',
    username_valid_charset: 'Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten',
    invalid_email: 'Die Email ist ungültig',
    invalid_phone: 'Die Telefonnummer ist ungültig',
    password_min_length: 'Passwort muss mindestens {{min}} Zeichen lang sein',
    passwords_do_not_match: 'Passwörter stimmen nicht überein',
    invalid_passcode: 'Der Bestätigungscode ist ungültig',
    invalid_connector_auth: 'Die Autorisierung ist ungültig',
    invalid_connector_request: 'Connector Daten sind ungültig',
    unknown: 'Unbekannter Fehler. Versuche es später noch einmal.',
    invalid_session: 'Die Sitzung ist ungültig. Bitte melde dich erneut an.',
  },
};

const de: LocalePhrase = Object.freeze({
  translation,
});

export default de;
