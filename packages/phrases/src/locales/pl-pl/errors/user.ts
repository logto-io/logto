const user = {
  username_already_in_use: 'Nazwa użytkownika jest już zajęta.',
  email_already_in_use: 'Ten email jest już powiązany z istniejącym kontem.',
  phone_already_in_use: 'Ten numer telefonu jest już powiązany z istniejącym kontem.',
  invalid_email: 'Nieprawidłowy adres email.',
  invalid_phone: 'Nieprawidłowy numer telefonu.',
  email_not_exist: 'Podany adres email nie został jeszcze zarejestrowany.',
  phone_not_exist: 'Podany numer telefonu nie został jeszcze zarejestrowany.',
  identity_not_exist: 'Konto społecznościowe nie zostało jeszcze zarejestrowane.',
  identity_already_in_use: 'Konto społecznościowe zostało już powiązane z istniejącym kontem.',
  social_account_exists_in_profile:
    'To konto społecznościowe zostało już powiązane z Twoim profilem.',
  cannot_delete_self: 'Nie możesz usunąć swojego konta.',
  sign_up_method_not_enabled: 'Rejestracja tym sposobem jest wyłączona.',
  sign_in_method_not_enabled: 'Logowanie tym sposobem jest wyłączone.',
  same_password: 'Nowe hasło nie może być takie samo jak stare hasło.',
  password_required_in_profile: 'Musisz ustawić hasło przed zalogowaniem.',
  new_password_required_in_profile: 'Musisz ustawić nowe hasło.',
  password_exists_in_profile: 'Hasło już istnieje w Twoim profilu.',
  username_required_in_profile: 'Musisz ustawić nazwę użytkownika przed zalogowaniem.',
  username_exists_in_profile: 'Nazwa użytkownika już istnieje w Twoim profilu.',
  email_required_in_profile: 'Musisz dodać adres email przed zalogowaniem.',
  email_exists_in_profile: 'Twój profil jest już powiązany z adresem email.',
  phone_required_in_profile: 'Musisz dodać numer telefonu przed zalogowaniem.',
  phone_exists_in_profile: 'Twój profil jest już powiązany z numerem telefonu.',
  email_or_phone_required_in_profile:
    'Musisz dodać adres email lub numer telefonu przed zalogowaniem.',
  suspended: 'To konto jest zawieszone.',
  user_not_exist: 'Użytkownik z identyfikatorem {{ identifier }} nie istnieje.',
  missing_profile: 'Musisz podać dodatkowe informacje przed zalogowaniem.',
  role_exists: 'Identyfikator roli {{roleId}} jest już dodany do tego użytkownika',
  invalid_role_type: 'Nieprawidłowy typ roli, nie można przypisać roli maszynowej do użytkownika.',
  missing_mfa: 'Musisz podłączyć dodatkowe MFA przed zalogowaniem.',
  totp_already_in_use: 'TOTP jest już w użyciu.',
  backup_code_already_in_use: 'Kod zapasowy jest już w użyciu.',
  password_algorithm_required: 'Wymagany jest algorytm hasła.',
  password_and_digest:
    'Nie możesz ustawić zarówno hasła w postaci tekstu jawnego, jak i skrótu hasła.',
  personal_access_token_name_exists: 'Nazwa osobistego tokenu dostępu już istnieje.',
  totp_secret_invalid: 'Podano nieprawidłowy sekret TOTP.',
  wrong_backup_code_format: 'Format kodu zapasowego jest nieprawidłowy.',
  username_required:
    'Nazwa użytkownika jest wymagana jako identyfikator, nie możesz ustawić jej jako null.',
  email_or_phone_required:
    'Adres email lub numer telefonu jest wymaganym identyfikatorem, co najmniej jeden z nich jest wymagany.',
  email_required: 'Adres email jest wymaganym identyfikatorem, nie możesz ustawić go jako null.',
  phone_required: 'Numer telefonu jest wymaganym identyfikatorem, nie możesz ustawić go jako null.',
  enterprise_sso_identity_not_exists:
    'Użytkownik nie ma tożsamości przedsiębiorstwa powiązanej ze wskazanym identyfikatorem połączenia SSO: {{ ssoConnectorId }}.',
  /** UNTRANSLATED */
  identity_not_exists_in_current_user:
    'The specified identity does not exist in the current user account. Please link the identity before proceeding.',
};

export default Object.freeze(user);
