const applications = {
  page_title: 'Aplikacje',
  title: 'Aplikacje',
  subtitle:
    'Skonfiguruj uwierzytelnianie Logto dla Twojej aplikacji natywnej, jednostronicowej, komunikującej się bezpośrednio z zasobami lub tradycyjnej',
  subtitle_with_app_type: 'Skonfiguruj uwierzytelnianie Logto dla twojej aplikacji {{name}}',
  create: 'Utwórz aplikację',
  /** UNTRANSLATED */
  create_subtitle_third_party:
    'Use Logto as your identity provider (IdP) to easily integrate with third-party applications',
  application_name: 'Nazwa aplikacji',
  application_name_placeholder: 'Moja aplikacja',
  application_description: 'Opis aplikacji',
  application_description_placeholder: 'Wprowadź opis swojej aplikacji',
  select_application_type: 'Wybierz typ aplikacji',
  no_application_type_selected: 'Nie wybrałeś jeszcze żadnego typu aplikacji',
  application_created: 'Aplikacja ostała pomyślnie utworzona.',
  tab: {
    /** UNTRANSLATED */
    my_applications: 'My apps',
    /** UNTRANSLATED */
    third_party_applications: 'Third party apps',
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
      title: 'Machine-to-Machine',
      subtitle: 'Aplikacja (zazwyczaj usługa), która bezpośrednio komunikuje się z zasobami',
      description: 'Na przykład usługa backendowa',
    },
    protected: {
      /** UNTRANSLATED */
      title: 'Protected App',
      /** UNTRANSLATED */
      subtitle: 'An app that is protected by Logto',
      /** UNTRANSLATED */
      description: 'N/A',
    },
    third_party: {
      /** UNTRANSLATED */
      title: 'Third-party app',
      /** UNTRANSLATED */
      subtitle: 'An app that is used as a third-party IdP connector',
      /** UNTRANSLATED */
      description: 'E.g., OIDC, SAML',
    },
  },
  placeholder_title: 'Wybierz typ aplikacji, aby kontynuować',
  placeholder_description:
    'Logto używa jednostki aplikacji dla OIDC, aby pomóc w takich zadaniach jak identyfikowanie Twoich aplikacji, zarządzanie logowaniem i tworzenie dzienników audytu.',
};

export default Object.freeze(applications);
