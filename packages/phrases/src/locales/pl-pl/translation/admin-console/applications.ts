const applications = {
  page_title: 'Aplikacje',
  title: 'Aplikacje',
  subtitle:
    'Skonfiguruj uwierzytelnianie Logto dla Twojej aplikacji natywnej, jednostronicowej, komunikującej się bezpośrednio z zasobami lub tradycyjnej',
  subtitle_with_app_type: 'Skonfiguruj uwierzytelnianie Logto dla twojej aplikacji {{name}}',
  create: 'Utwórz aplikację',
  create_subtitle_third_party:
    'Użyj Logto jako swojego dostawcy tożsamości (IdP), aby łatwo integrować się z aplikacjami stron trzecich',
  application_name: 'Nazwa aplikacji',
  application_name_placeholder: 'Moja aplikacja',
  application_description: 'Opis aplikacji',
  application_description_placeholder: 'Wprowadź opis swojej aplikacji',
  select_application_type: 'Wybierz typ aplikacji',
  no_application_type_selected: 'Nie wybrałeś jeszcze żadnego typu aplikacji',
  application_created: 'Aplikacja została pomyślnie utworzona.',
  tab: {
    my_applications: 'Moje aplikacje',
    third_party_applications: 'Aplikacje stron trzecich',
  },
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
      title: 'Komunikacja maszyna-do-maszyny',
      subtitle: 'Aplikacja (zazwyczaj usługa), która bezpośrednio komunikuje się z zasobami',
      description: 'Na przykład usługa backendowa',
    },
    protected: {
      title: 'Chroniona aplikacja',
      subtitle: 'Aplikacja chroniona przez Logto',
      description: 'N/A',
    },
    third_party: {
      title: 'Aplikacja stron trzecich',
      subtitle: 'Aplikacja używana jako łącznik do dostawcy tożsamości stron trzecich',
      description: 'Np. OIDC, SAML',
    },
  },
  placeholder_title: 'Wybierz typ aplikacji, aby kontynuować',
  placeholder_description:
    'Logto używa jednostki aplikacji dla OIDC, aby pomóc w takich zadaniach jak identyfikowanie Twoich aplikacji, zarządzanie logowaniem i tworzenie dzienników audytu.',
};

export default Object.freeze(applications);
