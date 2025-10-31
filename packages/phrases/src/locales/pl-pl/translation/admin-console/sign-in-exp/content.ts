const content = {
  terms_of_use: {
    title: 'TERMS',
    description: 'Dodaj Warunki i Prywatność, aby spełnić wymagania zgodności.',
    terms_of_use: 'Adres URL regulaminu',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'Adres URL polityki prywatności',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: 'Zgadzam się na warunki',
    agree_policies: {
      automatic: 'Kontynuuj automatyczne zgadzanie się na warunki',
      manual_registration_only: 'Wymagaj zgody na warunki przy rejestracji',
      manual: 'Wymagaj zgody na warunki przy rejestracji i logowaniu',
    },
  },
  languages: {
    title: 'JĘZYKI',
    enable_auto_detect: 'Włącz automatyczne wykrywanie',
    description:
      'Twoje oprogramowanie wykrywa ustawienia regionalne użytkownika i przełącza się na lokalny język. Możesz dodawać nowe języki, tłumacząc interfejs z angielskiego na inny język.',
    manage_language: 'Zarządzaj językiem',
    default_language: 'Domyślny język',
    default_language_description_auto:
      'Domyślny język zostanie użyty, gdy wykryty język użytkownika nie znajduje się w bieżącej bibliotece języków.',
    default_language_description_fixed:
      'Gdy automatyczne wykrywanie jest wyłączone, domyślny język jest jedynym, który pokaże Twoje oprogramowanie. Włącz automatyczne wykrywanie, aby rozszerzyć obsługę języków.',
  },
  support: {
    title: 'POMOC',
    subtitle:
      'Wyświetl swoje kanały pomocy na stronach błędów, aby zapewnić szybką pomoc użytkownikowi.',
    support_email: 'E-mail wsparcia',
    support_email_placeholder: 'support@email.com',
    support_website: 'Strona wsparcia',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: 'Zarządzaj językiem',
    subtitle:
      'Dostosuj produkt, dodając języki i tłumaczenia. Twój wkład może zostać ustawiony jako język domyślny.',
    add_language: 'Dodaj język',
    logto_provided: 'Dostarczone przez Logto',
    key: 'Klucz',
    logto_source_values: 'Wartości źródłowe Logto',
    custom_values: 'Wartości niestandardowe',
    clear_all_tip: 'Wyczyść wszystkie wartości',
    unsaved_description: 'Zmiany nie zostaną zapisane, jeśli opuścisz tę stronę bez zapisania.',
    deletion_tip: 'Usuń język',
    deletion_title: 'Czy chcesz usunąć dodany język?',
    deletion_description: 'Po usunięciu użytkownicy nie będą mogli już korzystać z tego języka.',
    default_language_deletion_title: 'Nie można usunąć domyślnego języka.',
    default_language_deletion_description:
      '{{language}} jest ustawiony jako język domyślny i nie może zostać usunięty.',
  },
};

export default Object.freeze(content);
