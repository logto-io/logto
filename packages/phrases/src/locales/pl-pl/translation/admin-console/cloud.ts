const cloud = {
  console_sso: {
    back_to_list: 'Wróć do Console SSO',
    create: 'Dodaj konektor',
    title: 'SSO konsoli',
    description:
      'Skonfiguruj własnego dostawcę tożsamości, aby logować się do Logto Console za pomocą jednokrotnego logowania.',
    domain_bound: 'Powiązana',
    domain_pending: 'Weryfikowanie',
    domain_add_placeholder: 'Dodaj domenę e-mail',
    domain_bound_description:
      'Ta domena jest aktywna dla Console SSO. Jej rekord TXT został usunięty.',
    domain_dns_instructions:
      'Dodaj ten rekord TXT u dostawcy DNS, aby potwierdzić własność domeny.',
    domain_waiting_for_dns: 'Oczekiwanie na rekord TXT. Sprawdzamy ponownie co 10 sekund.',
    domain_proven_unbound:
      'Własność domeny została potwierdzona, ale powiązanie nie jest ukończone. Rozwiąż problem i spróbuj ponownie.',
    domain_remove_description:
      'Usunąć {{domain}} z Console SSO? Usunięcie powiązanej domeny zatrzyma wykrywanie SSO dla jej adresów e-mail.',
    domain_invalid: 'Wprowadź prawidłową domenę e-mail.',
    domain_conflict: 'Ta domena jest już powiązana z innym łącznikiem Console SSO.',
    domain_invalid_provider: 'Ukończ ustawienia połączenia przed powiązaniem tej domeny.',
    domain_dns_timeout: 'Sprawdzanie DNS nie powiodło się. Spróbujemy ponownie automatycznie.',
    domain_recovery: 'Zmiana domeny jest nieukończona. Ponów weryfikację, aby ją zakończyć.',
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
