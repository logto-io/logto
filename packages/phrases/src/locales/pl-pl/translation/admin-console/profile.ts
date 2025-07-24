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
  fields: {
    /** UNTRANSLATED */
    name: 'Name',
    /** UNTRANSLATED */
    name_description:
      "The user's full name in displayable form including all name parts (e.g., “Jane Doe”).",
    /** UNTRANSLATED */
    avatar: 'Avatar',
    /** UNTRANSLATED */
    avatar_description: "URL of the user's avatar image.",
    /** UNTRANSLATED */
    familyName: 'Family name',
    /** UNTRANSLATED */
    familyName_description: 'The user\'s surname(s) or last name(s) (e.g., "Doe").',
    /** UNTRANSLATED */
    givenName: 'Given name',
    /** UNTRANSLATED */
    givenName_description: 'The user\'s given name(s) or first name(s) (e.g., "Jane").',
    /** UNTRANSLATED */
    middleName: 'Middle name',
    /** UNTRANSLATED */
    middleName_description: 'The user\'s middle name(s) (e.g., "Marie").',
    /** UNTRANSLATED */
    nickname: 'Nickname',
    /** UNTRANSLATED */
    nickname_description:
      'Casual or familiar name for the user, which may differ from their legal name.',
    /** UNTRANSLATED */
    preferredUsername: 'Preferred username',
    /** UNTRANSLATED */
    preferredUsername_description:
      'Shorthand identifier by which the user wishes to be referenced.',
    /** UNTRANSLATED */
    profile: 'Profile',
    /** UNTRANSLATED */
    profile_description:
      "URL of the user's human-readable profile page (e.g., social media profile).",
    /** UNTRANSLATED */
    website: 'Website',
    /** UNTRANSLATED */
    website_description: "URL of the user's personal website or blog.",
    /** UNTRANSLATED */
    gender: 'Gender',
    /** UNTRANSLATED */
    gender_description: 'The user\'s self-identified gender (e.g., "Female", "Male", "Non-binary")',
    /** UNTRANSLATED */
    birthdate: 'Birthdate',
    /** UNTRANSLATED */
    birthdate_description: 'The user\'s date of birth in a specified format (e.g., "MM-dd-yyyy").',
    /** UNTRANSLATED */
    zoneinfo: 'Timezone',
    /** UNTRANSLATED */
    zoneinfo_description:
      'The user\'s timezone in IANA format (e.g., "America/New_York" or "Europe/Paris").',
    /** UNTRANSLATED */
    locale: 'Language',
    /** UNTRANSLATED */
    locale_description: 'The user\'s language in IETF BCP 47 format (e.g., "en-US" or "zh-CN").',
    address: {
      /** UNTRANSLATED */
      formatted: 'Address',
      /** UNTRANSLATED */
      streetAddress: 'Street address',
      /** UNTRANSLATED */
      locality: 'City',
      /** UNTRANSLATED */
      region: 'State',
      /** UNTRANSLATED */
      postalCode: 'Zip code',
      /** UNTRANSLATED */
      country: 'Country',
    },
    /** UNTRANSLATED */
    address_description:
      'The user\'s full address in displayable form including all address parts (e.g., "123 Main St, Anytown, USA 12345").',
    /** UNTRANSLATED */
    fullname: 'Fullname',
    /** UNTRANSLATED */
    fullname_description:
      'Flexibly combines familyName, givenName, and middleName based on configuration.',
  },
};

export default Object.freeze(profile);
