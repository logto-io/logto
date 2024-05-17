const description = {
  email: 'Email',
  phone_number: 'Telefonnummer',
  username: 'Benutzername',
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
  link_email_description: 'Für zusätzliche Sicherheit, verknüpfe bitte deine Email mit dem Konto.',
  link_phone_description:
    'Für zusätzliche Sicherheit, verknüpfe bitte deine Telefonnummer mit dem Konto.',
  link_email_or_phone_description:
    'Für zusätzliche Sicherheit, verknüpfe bitte deine Email oder Telefonnummer mit dem Konto.',
  continue_with_more_information:
    'Für zusätzliche Sicherheit, vervollständige bitte deine Informationen.',
  create_your_account: 'Erstelle dein Konto',
  sign_in_to_your_account: 'Melde dich in deinem Konto an',
  no_region_code_found: 'Kein Regionencode gefunden',
  verify_email: 'Bestätige deine E-Mail-Adresse',
  verify_phone: 'Bestätige deine Telefonnummer',
  password_requirements: 'Passwort {{items, list}}.',
  password_requirement: {
    length_one: 'erfordert mindestens {{count}} Zeichen',
    length_other: 'erfordert mindestens {{count}} Zeichen',
    character_types_one:
      'sollte mindestens {{count}} Kategorie der folgenden Zeichenarten enthalten: Großbuchstaben, Kleinbuchstaben, Zahlen und Symbole',
    character_types_other:
      'sollte mindestens {{count}} Kategorien der folgenden Zeichenarten enthalten: Großbuchstaben, Kleinbuchstaben, Zahlen und Symbole',
  },
  use: 'Verwenden',
  single_sign_on_email_form: 'Gib deine Unternehmens-E-Mail-Adresse ein.',
  single_sign_on_connectors_list:
    'Ihr Unternehmen hat Single Sign-On für das E-Mail-Konto {{email}} aktiviert. Sie können sich weiterhin mit den folgenden SSO-Anbietern anmelden.',
  single_sign_on_enabled: 'Single Sign-On ist für dieses Konto aktiviert',
  /** UNTRANSLATED */
  authorize_title: 'Authorize {{name}}',
  /** UNTRANSLATED */
  request_permission: '{{name}} is requesting access to:',
  /** UNTRANSLATED */
  grant_organization_access: 'Grant the organization access:',
  /** UNTRANSLATED */
  authorize_personal_data_usage: 'Authorize the use of your personal data:',
  /** UNTRANSLATED */
  authorize_organization_access: 'Authorize access to the specific organization:',
  /** UNTRANSLATED */
  user_scopes: 'Personal user data',
  /** UNTRANSLATED */
  organization_scopes: 'Organization access',
  /** UNTRANSLATED */
  authorize_agreement: `By authorizing the access, you agree to the {{name}}'s <link></link>.`,
  /** UNTRANSLATED */
  authorize_agreement_with_redirect: `By authorizing the access, you agree to the {{name}}'s <link></link>, and will be redirected to {{uri}}.`,
  /** UNTRANSLATED */
  not_you: 'Not you?',
  /** UNTRANSLATED */
  user_id: 'User ID: {{id}}',
  /** UNTRANSLATED */
  redirect_to: 'You will be redirected to {{name}}.',
};

export default Object.freeze(description);
