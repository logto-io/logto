const applications = {
  page_title: 'Aplikacje',
  title: 'Aplikacje',
  subtitle:
    'Skonfiguruj uwierzytelnianie Logto dla Twojej aplikacji natywnej, jednostronicowej, komunikującej się bezpośrednio z zasobami lub tradycyjnej',
  create: 'Utwórz aplikację',
  application_name: 'Nazwa aplikacji',
  application_name_placeholder: 'Moja aplikacja',
  application_description: 'Opis aplikacji',
  application_description_placeholder: 'Wprowadź opis swojej aplikacji',
  select_application_type: 'Wybierz typ aplikacji',
  no_application_type_selected: 'Nie wybrałeś jeszcze żadnego typu aplikacji',
  application_created:
    'Aplikacja {{name}} została pomyślnie utworzona.\nTeraz zakończ konfigurację aplikacji.',
  app_id: 'ID aplikacji',
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
      title: 'Komunikacja maszyna do maszyny',
      subtitle: 'Aplikacja (zazwyczaj usługa), która bezpośrednio komunikuje się z zasobami',
      description: 'Na przykład usługa backendowa',
    },
  },
  guide: {
    get_sample_file: 'Pobierz przykład',
    header_description:
      'Postępuj zgodnie z przewodnikiem krok po kroku, aby zintegrować swoją aplikację lub kliknij prawy przycisk, aby pobrać nasz przykładowy projekt',
    title: 'Aplikacja została pomyślnie utworzona',
    subtitle:
      'Teraz postępuj zgodnie z poniższymi krokami, aby zakończyć konfigurację aplikacji. Wybierz typ SDK, aby kontynuować.',
    description_by_sdk:
      'Ten przewodnik po szybkim rozpoczęciu demonstruje, jak zintegrować Logto z aplikacją {{sdk}}',
    finish_and_done: 'Zakończ i zrobione',
    cannot_find_guide: "Can't find your guide?", // UNTRANSLATED
    describe_guide_looking_for: 'Describe the guide you are looking for', // UNTRANSLATED
    describe_guide_looking_for_placeholder: 'E.g., I want to integrate Logto into my Angular app.', // UNTRANSLATED
    request_guide_successfully: 'Your request has been successfully submitted. Thank you!', // UNTRANSLATED
  },
  placeholder_title: 'Wybierz typ aplikacji, aby kontynuować',
  placeholder_description:
    'Logto używa jednostki aplikacji dla OIDC, aby pomóc w takich zadaniach jak identyfikowanie Twoich aplikacji, zarządzanie logowaniem i tworzenie dzienników audytu.',
};

export default Object.freeze(applications);
