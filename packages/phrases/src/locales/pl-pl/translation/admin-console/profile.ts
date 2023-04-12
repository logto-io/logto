const profile = {
  page_title: 'Ustawienia konta',
  title: 'Ustawienia konta',
  description:
    'Zmień swoje ustawienia konta i zarządzaj swoimi danymi osobistymi tutaj, aby zapewnić bezpieczeństwo Twojego konta.',
  settings: {
    title: 'USTAWIENIA PROFILU',
    profile_information: 'Informacje o profilu',
    avatar: 'Awatar',
    name: 'Nazwa',
    username: 'Nazwa użytkownika',
  },
  link_account: {
    title: 'POŁĄCZ KONTO',
    email_sign_in: 'Zaloguj się przez e-mail',
    email: 'Email',
    social_sign_in: 'Zaloguj się przez media społecznościowe',
    link_email: 'Połącz email',
    link_email_subtitle: 'Połącz swój email, aby się zalogować lub pomóc w odzyskiwaniu konta.',
    email_required: 'Email jest wymagany',
    invalid_email: 'Nieprawidłowy adres email',
    identical_email_address: 'Adres email jest taki sam jak obecny',
    anonymous: 'Anonimowy',
  },
  password: {
    title: 'HASŁO I BEZPIECZEŃSTWO',
    password: 'Hasło',
    password_setting: 'Ustawienia hasła',
    new_password: 'Nowe hasło',
    confirm_password: 'Potwierdź hasło',
    enter_password: 'Wprowadź obecne hasło',
    enter_password_subtitle:
      'Zweryfikuj swoją tożsamość, aby chronić bezpieczeństwo swojego konta. Przed zmianą proszę wprowadzić swoje aktualne hasło.',
    set_password: 'Ustaw hasło',
    verify_via_password: 'Zweryfikuj za pomocą hasła',
    show_password: 'Pokaż hasło',
    required: 'Hasło jest wymagane',
    min_length: 'Hasło wymaga co najmniej {{min}} znaków.',
    do_not_match: 'Hasła nie pasują do siebie. Spróbuj ponownie.',
  },
  code: {
    enter_verification_code: 'Wprowadź kod weryfikacyjny',
    enter_verification_code_subtitle:
      'Kod weryfikacyjny został wysłany na adres <strong>{{target}}</strong>',
    verify_via_code: 'Zweryfikuj za pomocą kodu weryfikacyjnego',
    resend: 'Wyślij ponownie kod weryfikacyjny',
    resend_countdown: 'Wyślij ponownie za {{countdown}} sekund',
  },
  delete_account: {
    title: 'USUŃ KONTO',
    label: 'Usuń konto',
    description:
      'Usunięcie twojego konta spowoduje usunięcie wszystkich twoich danych osobistych, danych użytkownika i konfiguracji. Ta operacja nie może być cofnięta.',
    button: 'Usuń konto',
    dialog_paragraph_1:
      'Żałujemy, że chcesz usunąć swoje konto. Usunięcie twojego konta spowoduje trwałe usunięcie wszystkich danych, w tym informacji o użytkowniku, logów i ustawień, i ta operacja nie może być cofnięta. Przed dokonaniem tej operacji zalecamy wykonanie kopii zapasowych ważnych danych.',
    dialog_paragraph_2:
      'Aby przejść do procesu usuwania konta, wyślij email do naszego zespołu wsparcia na adres <a>{{mail}}</a> z tematem "Żądanie usunięcia konta". Pomożemy Ci i zapewnimy, że wszystkie twoje dane zostaną poprawnie usunięte z naszego systemu.',
    dialog_paragraph_3:
      'Dziękujemy za wybranie chmury Logto. Jeśli masz jakieś dodatkowe pytania lub wątpliwości, skontaktuj się z nami.',
  },
  set: 'Ustaw',
  change: 'Zmień',
  link: 'Połącz',
  unlink: 'Odłącz',
  not_set: 'Nie ustawione',
  change_avatar: 'Zmień awatar',
  change_name: 'Zmień nazwę',
  change_username: 'Zmień nazwę użytkownika',
  set_name: 'Ustaw nazwę',
  email_changed: 'Adres email został zmieniony!',
  password_changed: 'Hasło zostało zmienione!',
  updated: '{{target}} zaktualizowane!',
  linked: '{{target}} połączone!',
  unlinked: '{{target}} rozłączone!',
  email_exists_reminder:
    'Ten adres e-mail {{email}} jest powiązany z istniejącym kontem. Połącz inny e-mail tutaj.',
  unlink_confirm_text: 'Tak, odłącz',
  unlink_reminder:
    'Użytkownicy nie będą mogli się zalogować z kontem <span></span>, jeśli je odłączysz. Czy na pewno chcesz kontynuować?',
};

export default profile;
