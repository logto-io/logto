const cloud = {
  console_sso: {
    create: 'Dodaj konektor',
    title: 'SSO konsoli',
    description:
      'Skonfiguruj własnego dostawcę tożsamości, aby logować się do Logto Console za pomocą jednokrotnego logowania.',
    domain_bound: 'Zweryfikowano',
    domain_pending: 'Oczekuje na weryfikację',
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
