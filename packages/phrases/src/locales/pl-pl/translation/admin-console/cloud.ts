const cloud = {
  self_hosted_licenses: {
    title: 'Licencje self-hosted',
    description: 'Przeglądaj licencje swojego konta i kopiuj klucze dla własnych wdrożeń.',
    empty_title: 'Nie masz jeszcze licencji self-hosted',
    empty_description:
      'Tutaj pojawią się licencje przypisane do tego konta. Dzierżawca Cloud nie jest wymagany.',
    load_error: 'Nie udało się wczytać licencji. Spróbuj ponownie.',
    period_end: 'Koniec bieżącego okresu',
    keys_title: 'Klucze licencyjne',
    keys_description:
      'Zachowaj klucze w tajemnicy. Użyj klucza odpowiedniego dla środowiska wdrożenia.',
    production_key: 'Klucz produkcyjny',
    non_production_key: 'Klucz nieprodukcyjny',
    keys_unavailable:
      'Klucze tej licencji są niedostępne. W razie potrzeby skontaktuj się ze wsparciem.',
    install_title: 'Zainstaluj licencję',
    install_description:
      'Oba klucze zapewniają te same funkcje i limity. Zainstalowany klucz oznacza wdrożenie jako produkcyjne lub nieprodukcyjne.',
    install_copy:
      'Skopiuj klucz produkcyjny dla produkcji lub klucz nieprodukcyjny do prac programistycznych i testów.',
    install_paste: 'We własnej konsoli otwórz Ustawienia → Licencja, wklej klucz i zainstaluj go.',
    status: {
      active: 'Aktywna',
      past_due: 'Zaległa płatność',
      canceling: 'Anulowanie na koniec okresu',
      canceled: 'Anulowana',
      unpaid: 'Nieopłacona',
      expired: 'Wygasła',
      revoked: 'Cofnięta',
    },
  },
  console_sso: {
    back_to_list: 'Wróć do Console SSO',
    create: 'Dodaj konektor',
    title: 'SSO konsoli',
    description:
      'Skonfiguruj własnego dostawcę tożsamości, aby logować się do Logto Console za pomocą jednokrotnego logowania.',
    domain_bound: 'Powiązana',
    domain_pending: 'Weryfikowanie',
    domain_verify_step: 'Zweryfikuj domenę',
    domain_bind_step: 'Powiąż domenę e-mail',
    domain_add_placeholder: 'Dodaj domenę e-mail',
    domain_bound_description:
      'Ta domena jest aktywna dla Console SSO. Jej rekord TXT został usunięty.',
    domain_dns_instructions:
      'Dodaj ten rekord TXT u dostawcy DNS, aby potwierdzić własność domeny.',
    domain_waiting_for_dns: 'Oczekiwanie na rekord TXT. Sprawdzamy ponownie co 10 sekund.',
    domain_proven_unbound:
      'Własność domeny została potwierdzona, ale powiązanie nie jest ukończone.',
    domain_verified: 'Własność domeny została zweryfikowana.',
    domain_binding_pending: 'Powiązanie rozpocznie się automatycznie po weryfikacji.',
    domain_remove_description:
      'Usunąć {{domain}} z Console SSO? Usunięcie powiązanej domeny zatrzyma wykrywanie SSO dla jej adresów e-mail.',
    domain_invalid: 'Wprowadź prawidłową domenę e-mail.',
    domain_conflict: 'Ta domena jest już powiązana z innym łącznikiem Console SSO.',
    domain_invalid_provider: 'Ukończ ustawienia połączenia przed powiązaniem tej domeny.',
    domain_dns_timeout: 'Sprawdzanie DNS nie powiodło się. Spróbujemy ponownie automatycznie.',
    domain_recovery: 'Zmiana domeny jest nieukończona.',
    start_over: 'Zacznij od nowa',
    start_over_confirmation:
      'Rozpoczęcie od nowa może usunąć niedokończoną konfigurację SSO. Czy chcesz kontynuować?',
    resume_creation:
      'Znaleziono niedokończone tworzenie. Kontynuuj z tym samym dostawcą, aby odzyskać ten konektor.',
  },
  general: {
    onboarding: 'Wdrażanie',
  },
  create_tenant: {
    page_title: 'Utwórz najemcę',
    title: 'Utwórz swojego pierwszego najemcę',
    description:
      'Najemca to odizolowane środowisko, w którym możesz zarządzać tożsamościami użytkowników, aplikacjami i wszystkimi innymi zasobami Logto.',
    invite_collaborators: 'Zaproś swoich współpracowników za pomocą e-maila',
    hear_about_us: {
      title: 'Jak po raz pierwszy dowiedziałeś się o Logto?',
      detail_placeholder: 'Powiedz nam więcej (opcjonalnie)',
      options: {
        search_engine: 'Wyszukiwarka (Google, Bing...)',
        ai_assistant: 'Asystent AI (ChatGPT, Claude, Gemini...)',
        github_oss: 'GitHub lub katalogi open source',
        friend_colleague: 'Znajomy lub współpracownik',
        powered_by: 'Strona logowania aplikacji korzystającej z Logto',
        content_social: 'Media społecznościowe, artykuł lub wideo (YouTube, X, Reddit...)',
        other: 'Inne',
      },
    },
  },
  social_callback: {
    title: 'Zalogowałeś się pomyślnie',
    description:
      'Zalogowałeś się pomyślnie używając swojego konta społecznościowego. Aby zapewnić bezproblemową integrację i dostęp do wszystkich funkcji Logto, zalecamy przejście do konfiguracji własnego konektora społecznościowego.',
    notice:
      'Prosimy unikać używania łącznika demo do celów produkcyjnych. Po zakończeniu testowania, uprzejmie prosimy o usunięcie łącznika demo i skonfigurowanie własnego łącznika przy użyciu swoich danych uwierzytelniających.',
  },
  tenant: {
    create_tenant: 'Stwórz najemcę',
  },
};

export default Object.freeze(cloud);
