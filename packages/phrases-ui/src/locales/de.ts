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
    social_bind_with:
      'Besitzt du schon ein Konto? Melde dich an, um {{methods, list(type: disjunction;)}} mit deiner Identität zu verbinden.',
  },
  action: {
    sign_in: 'Anmelden',
    continue: 'Weiter',
    create_account: 'Konto erstellen',
    create_account_without_linking: 'Erstelle ein Konto ohne Verknüpfung',
    create: 'Erstellen',
    enter_passcode: 'Bestätigungscode eingeben',
    confirm: 'Bestätigen',
    cancel: 'Abbrechen',
    save_password: 'Passwort speichern',
    bind: 'Mit {{address}} verknüpfen',
    bind_and_continue: 'Verknüpfen und weiter',
    back: 'Gehe zurück',
    nav_back: 'Zurück',
    agree: 'Zustimmen',
    got_it: 'Alles klar',
    sign_in_with: 'Mit {{name}} anmelden',
    forgot_password: 'Passwort vergessen?',
    switch_to: 'Zu {{method}} wechseln',
    sign_in_via_passcode: 'Mit Bestätigungscode anmelden',
    sign_in_via_password: 'Mit Passwort anmelden',
    change: '{{method}} ändern',
    link_another_email: 'Andere Email verknüpfen',
    link_another_phone: 'Andere Telefonnummer verknüpfen',
    link_another_email_or_phone: 'Andere Email oder Telefonnummer verknüpfen',
    show_password: 'Passwort anzeigen',
  },
  description: {
    email: 'Email',
    phone_number: 'Telefonnummer',
    username: 'benutzername',
    reminder: 'Erinnerung',
    not_found: '404 Nicht gefunden',
    agree_with_terms: 'Ich akzeptiere die ',
    agree_with_terms_modal: 'Bitte akzeptiere die <link></link>.',
    terms_of_use: 'Nutzungsbedingungen',
    sign_in: 'Anmelden',
    privacy_policy: 'Datenschutzrichtlinien',
    create_account: 'Konto erstellen',
    or: 'oder',
    and: 'und',
    enter_passcode: 'Der Bestätigungscode wurde an deine {{address}} gesendet',
    passcode_sent: 'Der Bestätigungscode wurde erneut gesendet',
    resend_after_seconds: 'Nach <span>{{seconds}}</span> Sekunden erneut senden',
    resend_passcode: 'Bestätigungscode erneut senden',
    create_account_id_exists:
      'Das Konto mit {{type}} {{value}} existiert bereits, möchtest du dich anmelden?',
    link_account_id_exists:
      'Das Konto mit {{type}} {{value}} existiert bereits, möchtest du es mit deinem Konto verknüpfen?',
    sign_in_id_does_not_exist:
      'Das Konto mit {{type}} {{value}} existiert nicht, möchtest du ein neues Konto erstellen?',
    sign_in_id_does_not_exist_alert: 'Das Konto mit {{type}} {{value}} existiert nicht',
    create_account_id_exists_alert:
      'Das Konto mit {{type}} {{value}} ist mit einem anderen Konto verknüpft. Bitte versuche es mit einem anderen {{type}} erneut',
    social_identity_exist:
      '{{type}} {{value}} ist mit einem anderen Konto verknüpft. Bitte versuche ein(e(n)) andere(n/s) {{type}}',
    bind_account_title: 'Verlinke oder erstelle ein Konto',
    social_create_account: 'Sie können ein neues Konto erstellen.',
    social_link_email: 'Du kannst eine weitere Email verknüpfen',
    social_link_phone: 'Du kannst eine weitere Telefonnummer verknüpfen',
    social_link_email_or_phone: 'Du kannst eine weitere Email oder Telefonnummer verknüpfen',
    social_bind_with_existing:
      'Wir haben eine verwandte {{method}} gefunden, die bereits registriert wurde, und Sie können sie direkt verknüpfen.',
    reset_password: 'Passwort vergessen',
    reset_password_description:
      'Gib die {{types, list(type: disjunction;)}} deines Kontos ein und wir senden dir einen Bestätigungscode um dein Passwort zurückzusetzen.',
    new_password: 'Neues Passwort',
    set_password: 'Passwort setzen',
    password_changed: 'Passwort geändert',
    no_account: 'Noch kein Konto? ',
    have_account: 'Hast du schon ein Konto?',
    enter_password: 'Passwort eingeben',
    enter_password_for: 'Passwort für {{method}} {{value}} eingeben',
    enter_username: 'Benutzernamen festlegen',
    enter_username_description:
      'Der Benutzername kann für die Anmeldung verwendet werden. Der Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten.',
    link_email: 'Email verknüpfen',
    link_phone: 'Telefonnummer verknüpfen',
    link_email_or_phone: 'Email oder Telefonnummer verknüpfen',
    link_email_description:
      'Für zusätzliche Sicherheit, verknüpfe bitte deine Email mit dem Konto.',
    link_phone_description:
      'Für zusätzliche Sicherheit, verknüpfe bitte deine Telefonnummer mit dem Konto.',
    link_email_or_phone_description:
      'Für zusätzliche Sicherheit, verknüpfe bitte deine Email oder Telefonnummer mit dem Konto.',
    continue_with_more_information:
      'Für zusätzliche Sicherheit, vervollständige bitte deine Informationen.',
    create_your_account: 'Erstelle dein Konto',
    welcome_to_sign_in: 'Willkommen zur Anmeldung',
  },
  error: {
    general_required: `{{types, list(type: disjunction;)}} ist erforderlich`,
    general_invalid: `Die {{types, list(type: disjunction;)}} is ungültig`,
    username_required: 'Benutzername ist erforderlich',
    password_required: 'Passwort ist erforderlich',
    username_exists: 'Benutzername existiert bereits',
    username_should_not_start_with_number: 'Benutzername darf nicht mit einer Zahl beginnen',
    username_invalid_charset: 'Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten',
    invalid_email: 'Die Email ist ungültig',
    invalid_phone: 'Die Telefonnummer ist ungültig',
    password_min_length: 'Passwort muss mindestens {{min}} Zeichen lang sein',
    passwords_do_not_match: 'Passwörter stimmen nicht überein',
    invalid_password:
      'Passwort erfordert mindestens {{min}} Zeichen und enthält eine Kombination aus Buchstaben, Zahlen und Symbolen.',
    invalid_passcode: 'Der Bestätigungscode ist ungültig',
    invalid_connector_auth: 'Die Autorisierung ist ungültig',
    invalid_connector_request: 'Connector Daten sind ungültig',
    unknown: 'Unbekannter Fehler. Versuche es später noch einmal.',
    invalid_session: 'Die Sitzung ist ungültig. Bitte melde dich erneut an.',
  },
  demo_app: {
    notification: 'Tipp: Erstelle zuerst ein Konto, um die Anmeldeerfahrung zu testen.',
  },
};

const de: LocalePhrase = Object.freeze({
  translation,
});

export default de;
