const description = {
  email: 'adres email',
  phone_number: 'numer telefonu',
  username: 'nazwa użytkownika',
  reminder: 'Przypomnienie',
  not_found: '404 Nie znaleziono',
  agree_with_terms: 'Przeczytałem/am i zgadzam się z ',
  agree_with_terms_modal: 'Do kontynuacji należy zaakceptować <link></link>.',
  terms_of_use: 'Warunki korzystania',
  sign_in: 'Zaloguj się',
  privacy_policy: 'Polityka prywatności',
  create_account: 'Utwórz konto',
  or: 'lub',
  and: 'i',
  enter_passcode: 'Kod weryfikacyjny został wysłany na twoje {{address}} {{target}}',
  passcode_sent: 'Kod weryfikacyjny został wysłany ponownie',
  resend_after_seconds: 'Wyślij ponownie po <span>{{seconds}}</span> sekundach',
  resend_passcode: 'Wyślij kod weryfikacyjny ponownie',
  create_account_id_exists: 'Konto z {{type}} {{value}} już istnieje. Czy chcesz się zalogować?',
  link_account_id_exists: 'Konto z {{type}} {{value}} już istnieje. Czy chcesz je połączyć?',
  sign_in_id_does_not_exist:
    'Konto z {{type}} {{value}} nie istnieje. Czy chcesz utworzyć nowe konto?',
  sign_in_id_does_not_exist_alert: 'Konto z {{type}} {{value}} nie istnieje.',
  create_account_id_exists_alert:
    'Konto z {{type}} {{value}} jest połączone z innym kontem. Spróbuj inny {{type}}.',
  social_identity_exist: '{{type}} {{value}} jest połączony z innym kontem. Spróbuj inny {{type}}.',
  bind_account_title: 'Połącz lub utwórz konto',
  social_create_account: 'Możesz utworzyć nowe konto.',
  social_link_email: 'Możesz połączyć kolejny adres email',
  social_link_phone: 'Możesz połączyć kolejny numer telefonu',
  social_link_email_or_phone: 'Możesz połączyć kolejny adres email lub numer telefonu',
  social_bind_with_existing: 'Znaleźliśmy powiązane konto, możesz je połączyć bezpośrednio.',
  reset_password: 'Zresetuj hasło',
  reset_password_description:
    'Wpisz {{types, lista(type: złączonych;)}} związanego z twoim kontem, a wyślemy ci kod weryfikacyjny do zresetowania hasła.',
  new_password: 'Nowe hasło',
  set_password: 'Ustaw hasło',
  password_changed: 'Hasło zmienione',
  no_account: 'Nie masz jeszcze konta? ',
  have_account: 'Masz już konto?',
  enter_password: 'Wpisz hasło',
  enter_password_for: 'Zaloguj się przy użyciu hasła do {{method}} {{value}}',
  enter_username: 'Ustaw nazwę użytkownika',
  enter_username_description:
    'Nazwa użytkownika jest alternatywną formą logowania. Nazwa użytkownika powinna zawierać tylko litery, cyfry i podkreślenia.',
  link_email: 'Połącz adres email',
  link_phone: 'Połącz numer telefonu',
  link_email_or_phone: 'Połącz adres email lub numer telefonu',
  link_email_description: 'Dla zwiększenia bezpieczeństwa, proszę połączyć konto z adresem e-mail.',
  link_phone_description:
    'Dla zwiększenia bezpieczeństwa, proszę połączyć konto z numerem telefonu.',
  link_email_or_phone_description:
    'Dla zwiększenia bezpieczeństwa, proszę połączyć konto z adresem e-mail lub numerem telefonu.',
  continue_with_more_information:
    'Dla zwiększenia bezpieczeństwa, proszę uzupełnić poniższe informacje o koncie.',
  create_your_account: 'Utwórz konto',
  sign_in_to_your_account: 'Zaloguj się do swojego konta',
  no_region_code_found: 'Nie znaleziono kodu regionu',
  verify_email: 'Potwierdź swój email',
  verify_phone: 'Potwierdź swój numer telefonu',
  password_requirements: 'Wymagania dotyczące hasła {{items, list}}.',
  password_requirement: {
    length_one: 'wymaga co najmniej {{count}} znaku',
    length_other: 'wymaga co najmniej {{count}} znaków',
    character_types_one:
      'powinno zawierać co najmniej {{count}} rodzaj liter wielkich, małych liter, cyfr i symboli',
    character_types_other:
      'powinno zawierać co najmniej {{count}} rodzaje liter wielkich, małych liter, cyfr i symboli',
  },
  use: 'Użyj',
  single_sign_on_email_form: 'Wpisz swój służbowy adres email',
  single_sign_on_connectors_list:
    'Twoja firma włączyła jednokrotne logowanie dla konta e-mail {{email}}. Możesz kontynuować logowanie za pomocą następujących dostawców SSO.',
  single_sign_on_enabled: 'To konto ma włączone jednokrotne logowanie.',
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
