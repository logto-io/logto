const applications = {
  page_title: 'Aplikacje',
  title: 'Aplikacje',
  subtitle:
    'Skonfiguruj uwierzytelnianie Logto dla Twojej aplikacji natywnej, jednostronicowej, komunikującej się bezpośrednio z zasobami lub tradycyjnej',
  subtitle_with_app_type: 'Skonfiguruj uwierzytelnianie Logto dla twojej aplikacji {{name}}',
  create_device_flow_description:
    'Utwórz natywną aplikację wykorzystującą OAuth 2.0 Device Authorization Grant dla urządzeń o ograniczonym wprowadzaniu danych lub aplikacji headless.',
  create: 'Utwórz aplikację',
  create_third_party: 'Utwórz aplikację stron trzecich',
  create_thrid_party_modal_title: 'Utwórz aplikację stron trzecich ({{type}})',
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
      description:
        'Na przykład aplikacja na iOS, aplikacja na Androida, aplikacja desktopowa, TV, CLI',
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
    saml: {
      title: 'Aplikacja SAML',
      subtitle: 'Aplikacja, która jest używana jako łącznik IdP SAML',
      description: 'Np. SAML',
    },
    third_party: {
      title: 'Aplikacja stron trzecich',
      subtitle: 'Aplikacja używana jako łącznik do dostawcy tożsamości stron trzecich',
      description: 'Np. OIDC, SAML',
    },
  },
  authorization_flow: {
    title: 'Przepływ autoryzacji',
    tooltip:
      'Wybierz przepływ autoryzacji dla swojej aplikacji. Po ustawieniu nie można go zmienić.',
    authorization_code: {
      title: 'Authorization code',
      description:
        'Domyślny i najczęściej stosowany typ autoryzacji. Użytkownicy są przekierowywani na stronę logowania, aby bezpośrednio autoryzować dostęp.',
    },
    device_flow: {
      title: 'Device flow',
      description:
        'Dla urządzeń z ograniczonym wprowadzaniem danych lub aplikacji bezinterfejsowych (np. telewizory, CLI). Użytkownicy kończą logowanie na oddzielnym urządzeniu, wprowadzając kod urządzenia lub skanując kod QR.',
    },
  },
  placeholder_title: 'Wybierz typ aplikacji, aby kontynuować',
  placeholder_description:
    'Logto używa jednostki aplikacji dla OIDC, aby pomóc w takich zadaniach jak identyfikowanie Twoich aplikacji, zarządzanie logowaniem i tworzenie dzienników audytu.',
  third_party_application_placeholder_description:
    'Użyj Logto jako dostawcy tożsamości, aby zapewnić autoryzację OAuth dla usług stron trzecich. \n Zawiera wbudowany ekran zgody użytkownika na dostęp do zasobów. <a>Dowiedz się więcej</a>',
  dynamic_app: {
    title: 'Aplikacja dynamiczna',
    subtitle: 'CIMD',
    description:
      'Aplikacja dynamiczna pozwala klientom OAuth łączyć się bez wcześniejszej rejestracji.',
    settings_description:
      'Aplikacja dynamiczna pozwala klientom OAuth łączyć się bez wcześniejszej rejestracji. Wykorzystuje specyfikację OAuth Client ID Metadata Document (CIMD).',
    app_id_placeholder: 'Dostarczany dynamicznie przez każdego klienta',
    enable_confirm_modal: {
      title: 'Włączyć dynamiczny dostęp klientów?',
      content:
        'Każdy klient OAuth z prawidłowym publicznym adresem URL identyfikatora klienta HTTPS może rozpocząć autoryzację dla tego najemcy bez wcześniejszej rejestracji. Dostęp pozostaje ograniczony przez Twoje maksymalne uprawnienia i zgodę użytkownika.',
    },
    enabled: 'Aplikacja dynamiczna została włączona.',
    disable_confirm_modal: {
      title: 'Wyłączyć aplikację dynamiczną?',
      content:
        'Klienci CIMD nie będą już mogli inicjować nowych żądań autoryzacji. Istniejące zgody zostaną zachowane, a wydane tokeny dostępu mogą pozostać ważne do czasu wygaśnięcia.',
    },
    disabled: 'Aplikacja dynamiczna została wyłączona.',
    permissions: {
      user_title: 'Użytkownik',
      user_description:
        'Wybierz uprawnienia żądane przez klientów OAuth do uzyskania dostępu do określonych danych użytkownika.',
      grant_user_level_permissions: 'Udziel uprawnień użytkownika',
      organization_title: 'Organizacja',
      organization_description:
        'Wybierz uprawnienia żądane przez klientów OAuth do uzyskania dostępu do określonych danych organizacyjnych.',
      grant_organization_level_permissions: 'Udziel uprawnień organizacji',
      permission_delete_confirm:
        'Ta czynność usunie uprawnienie z aplikacji dynamicznej, uniemożliwiając klientom OAuth żądanie autoryzacji użytkownika dla niego. Czy na pewno chcesz kontynuować?',
    },
  },
  guide: {
    third_party: {
      title: 'Zintegruj aplikację stron trzecich',
      description:
        'Użyj Logto jako dostawcy tożsamości, aby zapewnić autoryzację OAuth dla usług stron trzecich. Zawiera wbudowany ekran zgody użytkownika na bezpieczny dostęp do zasobów. <a>Dowiedz się więcej</a>',
    },
  },
};

export default Object.freeze(applications);
