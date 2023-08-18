const applications = {
  page_title: 'Aplikacje',
  title: 'Aplikacje',
  subtitle:
    'Skonfiguruj uwierzytelnianie Logto dla Twojej aplikacji natywnej, jednostronicowej, komunikującej się bezpośrednio z zasobami lub tradycyjnej',
  subtitle_with_app_type: 'Set up Logto authentication for your {{name}} application', // UNTRANSLATED
  create: 'Utwórz aplikację',
  application_name: 'Nazwa aplikacji',
  application_name_placeholder: 'Moja aplikacja',
  application_description: 'Opis aplikacji',
  application_description_placeholder: 'Wprowadź opis swojej aplikacji',
  select_application_type: 'Wybierz typ aplikacji',
  no_application_type_selected: 'Nie wybrałeś jeszcze żadnego typu aplikacji',
  application_created: 'Aplikacja ostała pomyślnie utworzona.',
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
    header_title: 'Select a framework or tutorial', // UNTRANSLATED
    modal_header_title: 'Start with SDK and guides', // UNTRANSLATED
    header_subtitle: 'Jumpstart your app development process with our pre-built SDK and tutorials.', // UNTRANSLATED
    start_building: 'Start Building', // UNTRANSLATED
    categories: {
      featured: 'Popular and for you', // UNTRANSLATED
      Traditional: 'Traditional web app', // UNTRANSLATED
      SPA: 'Single page app', // UNTRANSLATED
      Native: 'Native', // UNTRANSLATED
      MachineToMachine: 'Machine-to-machine', // UNTRANSLATED
    },
    filter: {
      title: 'Filter framework', // UNTRANSLATED
      placeholder: 'Search for framework', // UNTRANSLATED
    },
    select_a_framework: 'Select a framework', // UNTRANSLATED
    checkout_tutorial: 'Checkout {{name}} tutorial', // UNTRANSLATED
    get_sample_file: 'Pobierz przykład',
    title: 'Aplikacja została pomyślnie utworzona',
    subtitle:
      'Teraz postępuj zgodnie z poniższymi krokami, aby zakończyć konfigurację aplikacji. Wybierz typ SDK, aby kontynuować.',
    description_by_sdk:
      'Ten przewodnik po szybkim rozpoczęciu demonstruje, jak zintegrować Logto z aplikacją {{sdk}}',
    do_not_need_tutorial:
      'If you don’t need a tutorial, you can continue without a framework guide', // UNTRANSLATED
    create_without_framework: 'Create app without framework', // UNTRANSLATED
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
