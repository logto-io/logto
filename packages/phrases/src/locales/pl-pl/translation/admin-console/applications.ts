const applications = {
  page_title: 'Aplikacje',
  title: 'Aplikacje',
  subtitle:
    'Skonfiguruj uwierzytelnianie Logto dla Twojej aplikacji natywnej, jednostronicowej, komunikującej się bezpośrednio z zasobami lub tradycyjnej',
  subtitle_with_app_type: 'Skonfiguruj uwierzytelnianie Logto dla twojej aplikacji {{name}}',
  create: 'Utwórz aplikację',
  application_name: 'Nazwa aplikacji',
  application_name_placeholder: 'Moja aplikacja',
  application_description: 'Opis aplikacji',
  application_description_placeholder: 'Wprowadź opis swojej aplikacji',
  select_application_type: 'Wybierz typ aplikacji',
  no_application_type_selected: 'Nie wybrałeś jeszcze żadnego typu aplikacji',
  application_created: 'Aplikacja ostała pomyślnie utworzona.',
  app_id: 'App ID',
  type: {
    native: {
      title: 'Aplikacja natywna',
      subtitle: 'Aplikacja uruchamiana w środowisku natywnym',
      description: 'Na przykład aplikacja na iOS, aplikacja na Androida',
    },
    spa: {
      title: 'Aplikacja jednostronicowa',
      subtitle:
        'Aplikacja uruchamiana w przeglądarce internetowej i dynamicznie aktualizująca dane na miejscu',
      description: 'Na przykład aplikacja React DOM, aplikacja Vue',
    },
    traditional: {
      title: 'Tradycyjna strona internetowa',
      subtitle: 'Aplikacja, która renderuje i aktualizuje strony tylko przez serwer internetowy',
      description: 'Na przykład Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle: 'Aplikacja (zazwyczaj usługa), która bezpośrednio komunikuje się z zasobami',
      description: 'Na przykład usługa backendowa',
    },
  },
  guide: {
    header_title: 'Wybierz framework lub samouczek',
    modal_header_title: 'Rozpocznij z&nbsp;SDK i&nbsp;samouczkami',
    header_subtitle:
      'Rozpocznij proces tworzenia aplikacji&nbsp;za&nbsp;pomocą naszego SDK i&nbsp;samouczków.',
    start_building: 'Rozpocznij tworzenie',
    categories: {
      featured: 'Popularne oraz dedykowane tobie',
      Traditional: 'Tradycyjna aplikacja internetowa',
      SPA: 'Aplikacja jednostronicowa',
      Native: 'Natywna',
      MachineToMachine: 'Machine-to-machine',
    },
    filter: {
      title: 'Filtruj framework',
      placeholder: 'Wyszukaj framework',
    },
    select_a_framework: 'Wybierz framework',
    checkout_tutorial: 'Sprawdź samouczek dla {{name}}',
    get_sample_file: 'Pobierz przykład',
    title: 'Aplikacja została pomyślnie utworzona',
    subtitle:
      'Teraz postępuj zgodnie z&nbsp;poniższymi krokami, aby zakończyć konfigurację aplikacji. Wybierz typ SDK, aby kontynuować.',
    description_by_sdk:
      'Ten przewodnik po szybkim rozpoczęciu przedstawia, jak zintegrować Logto z&nbsp;aplikacją {{sdk}}',
    do_not_need_tutorial:
      'Jeśli nie potrzebujesz samouczka, możesz kontynuować bez przewodnika frameworka',
    create_without_framework: 'Utwórz aplikację bez użycia frameworka',
    finish_and_done: 'Zakończ i&nbsp;zrobione',
    cannot_find_guide: 'Nie możesz znaleźć odpowiedniego przewodnika?',
    describe_guide_looking_for: 'Opisz szukany przewodnik',
    describe_guide_looking_for_placeholder: 'Np. Chcę zintegrować logto do mojej aplikacji Angular',
    request_guide_successfully: 'Twoja prośba została wysłana pomyślnie. Dziękujemy!',
  },
  placeholder_title: 'Wybierz typ aplikacji, aby kontynuować',
  placeholder_description:
    'Logto używa jednostki aplikacji dla OIDC, aby pomóc w takich zadaniach jak identyfikowanie Twoich aplikacji, zarządzanie logowaniem i tworzenie dzienników audytu.',
};

export default Object.freeze(applications);
