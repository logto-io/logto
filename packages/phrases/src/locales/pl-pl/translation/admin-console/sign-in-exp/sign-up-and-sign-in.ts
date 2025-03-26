const sign_up_and_sign_in = {
  identifiers_email: 'Adres e-mail',
  identifiers_phone: 'Numer telefonu',
  identifiers_username: 'Nazwa użytkownika',
  identifiers_email_or_sms: 'Adres e-mail lub numer telefonu',
  identifiers_none: 'Nie dotyczy',
  and: 'i',
  or: 'lub',
  sign_up: {
    title: 'REJESTRACJA',
    sign_up_identifier: 'Identyfikator rejestracji',
    identifier_description:
      'Wszystkie wybrane identyfikatory rejestracji są wymagane przy tworzeniu nowego konta.',
    sign_up_authentication: 'Ustawienia uwierzytelniania dla rejestracji',
    authentication_description:
      'Wszystkie wybrane czynności będą obowiązkowe dla użytkowników, aby ukończyć proces rejestracji.',
    set_a_password_option: 'Utwórz hasło',
    verify_at_sign_up_option: 'Weryfikuj podczas rejestracji',
    social_only_creation_description: '(Stosuje się tylko do tworzenia kont społecznościowych)',
  },
  sign_in: {
    title: 'LOGOWANIE',
    sign_in_identifier_and_auth: 'Identyfikator i ustawienia uwierzytelniania dla logowania',
    description: 'Użytkownicy mogą się zalogować za pomocą dowolnej dostępnej opcji.',
    add_sign_in_method: 'Dodaj metodę logowania',
    add_sign_up_method: 'Dodaj metodę rejestracji',
    password_auth: 'Hasło',
    verification_code_auth: 'Kod weryfikacyjny',
    auth_swap_tip:
      'Zamień poniższe opcje, aby określić, która pojawia się jako pierwsza w procesie.',
    require_auth_factor: 'Musisz wybrać co najmniej jeden czynnik uwierzytelniający.',
  },
  social_sign_in: {
    title: 'LOGOWANIE SPOŁECZNOŚCIOWE',
    social_sign_in: 'Logowanie społecznościowe',
    description:
      'W zależności od obowiązkowego identyfikatora, którego ustawisz, użytkownik może zostać poproszony o podanie identyfikatora podczas rejestracji za pośrednictwem łącznika społecznościowego.',
    add_social_connector: 'Dodaj łącznik społecznościowy',
    set_up_hint: {
      not_in_list: 'Nie ma na liście?',
      set_up_more: 'Ustaw',
      go_to: 'inne łączniki społecznościowe teraz.',
    },
    automatic_account_linking: 'Automatyczne łączenie kont',
    automatic_account_linking_label:
      'Gdy jest włączone, jeśli użytkownik zaloguje się za pomocą tożsamości społecznościowej, która jest nowa w systemie, a istnieje jedno istniejące konto z tym samym identyfikatorem (np. adres e-mail), Logto automatycznie połączy konto z tożsamością społecznościową zamiast prosić użytkownika o powiązanie konta.',
  },
  tip: {
    set_a_password: 'Unikatowe hasło dla nazwy użytkownika jest konieczne.',
    verify_at_sign_up:
      'Obecnie obsługujemy tylko weryfikowany adres e-mail. Twoja baza użytkowników może zawierać dużą liczbę adresów e-mail niskiej jakości, jeśli nie dokonasz walidacji.',
    password_auth:
      'Jest to istotne, ponieważ umożliwiłeś opcję tworzenia hasła podczas procesu rejestracji.',
    verification_code_auth:
      'Jest to istotne, ponieważ umożliwiłeś wyłącznie opcję podania kodu weryfikacyjnego podczas rejestracji. Możesz odznaczyć pole wyboru, gdy dozwolone jest ustawienie hasła podczas procesu rejestracji.',
    delete_sign_in_method:
      'Jest to istotne, ponieważ wybrałeś {{identifier}} jako wymagany identyfikator.',
  },
  advanced_options: {
    title: 'USTAWIENIA ZAAWANSOWANE',
    enable_single_sign_on: 'Włącz jednokrotne logowanie przedsiębiorstwa (SSO)',
    enable_single_sign_on_description:
      'Włącz użytkownikom logowanie się do aplikacji za pomocą jednokrotnego logowania przy użyciu ich tożsamości przedsiębiorstwa.',
    single_sign_on_hint: {
      prefix: 'Przejdź do ',
      link: '"Enterprise SSO"',
      suffix: 'sekcji, aby skonfigurować więcej łączników przedsiębiorstwa.',
    },
    enable_user_registration: 'Włącz rejestrację użytkowników',
    enable_user_registration_description:
      'Włącz lub wyłącz rejestrację użytkowników. Po wyłączeniu użytkownicy nadal mogą być dodawani w konsoli administratora, ale nie mogą już zakładać kont za pomocą interfejsu logowania.',
    unknown_session_redirect_url: 'Nieznany URL przekierowania sesji',
    unknown_session_redirect_url_tip:
      'Czasami Logto może nie rozpoznać sesji użytkownika na stronie logowania, na przykład gdy sesja wygasa lub użytkownik dodaje stronę logowania do zakładek lub udostępnia link do logowania. Domyślnie pojawia się błąd 404 „nieznana sesja”. Aby poprawić doświadczenia użytkowników, ustaw domyślny URL na przekierowanie użytkowników z powrotem do Twojej aplikacji i ponowne rozpoczęcie uwierzytelniania.',
  },
};

export default Object.freeze(sign_up_and_sign_in);
