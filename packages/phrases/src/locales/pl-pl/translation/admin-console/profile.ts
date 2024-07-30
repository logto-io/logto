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
    p: {
      has_issue:
        'Przykro nam, że chcesz usunąć swoje konto. Przed usunięciem konta musisz rozwiązać następujące problemy.',
      after_resolved:
        'Po rozwiązaniu problemów, możesz usunąć swoje konto. Prosimy o kontakt, jeśli potrzebujesz pomocy.',
      check_information:
        'Przykro nam, że chcesz usunąć swoje konto. Proszę dokładnie sprawdzić poniższe informacje przed kontynuowaniem.',
      remove_all_data:
        'Usunięcie konta spowoduje trwałe usunięcie wszystkich danych o Tobie w Logto Cloud. Upewnij się, że masz kopię zapasową ważnych danych przed kontynuowaniem.',
      confirm_information:
        'Proszę potwierdzić, że powyższe informacje są zgodne z Twoimi oczekiwaniami. Po usunięciu konta nie będziemy mogli go odzyskać.',
      has_admin_role:
        'Ponieważ masz rolę administratora w poniższym najemcy, zostanie on usunięty wraz z Twoim kontem:',
      has_admin_role_other:
        'Ponieważ masz rolę administratora w poniższych najemcach, zostaną one usunięte wraz z Twoim kontem:',
      quit_tenant: 'Zamierzasz opuścić poniższego najemcę:',
      quit_tenant_other: 'Zamierzasz opuścić poniższych najemców:',
    },
    issues: {
      paid_plan: 'Poniższy najemca ma płatny plan, proszę najpierw anulować subskrypcję:',
      paid_plan_other: 'Poniżsi najemcy mają płatne plany, proszę najpierw anulować subskrypcję:',
      subscription_status: 'Poniższy najemca ma problem ze statusem subskrypcji:',
      subscription_status_other: 'Poniżsi najemcy mają problemy ze statusem subskrypcji:',
      open_invoice: 'Poniższy najemca ma otwartą fakturę:',
      open_invoice_other: 'Poniżsi najemcy mają otwarte faktury:',
    },
    error_occurred: 'Wystąpił błąd',
    error_occurred_description: 'Przepraszamy, wystąpił problem podczas usuwania Twojego konta:',
    request_id: 'ID żądania: {{requestId}}',
    try_again_later:
      'Spróbuj ponownie później. Jeśli problem będzie się powtarzał, skontaktuj się z zespołem Logto, podając ID żądania.',
    final_confirmation: 'Ostateczne potwierdzenie',
    about_to_start_deletion: 'Zaraz rozpoczniesz proces usuwania i tej operacji nie można cofnąć.',
    permanently_delete: 'Usuń na stałe',
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
  email_changed: 'Adres email został zmieniony.',
  password_changed: 'Hasło zostało zmienione.',
  updated: '{{target}} zaktualizowane.',
  linked: '{{target}} połączone.',
  unlinked: '{{target}} rozłączone.',
  email_exists_reminder:
    'Ten adres e-mail {{email}} jest powiązany z istniejącym kontem. Połącz inny e-mail tutaj.',
  unlink_confirm_text: 'Tak, odłącz',
  unlink_reminder:
    'Użytkownicy nie będą mogli się zalogować z kontem <span></span>, jeśli je odłączysz. Czy na pewno chcesz kontynuować?',
};

export default Object.freeze(profile);
