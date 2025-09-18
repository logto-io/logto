const connectors = {
  page_title: 'Łączniki',
  title: 'Łączniki',
  subtitle: 'Skonfiguruj łączniki, aby umożliwić bezhasłowe i społecznościowe logowanie',
  create: 'Dodaj łącznik społecznościowy',
  config_sie_notice: 'Ustawiono łączniki. Upewnij się, że skonfigurowałeś to w <a>{{link}}</a>.',
  config_sie_link_text: 'doświadczenie logowania',
  tab_email_sms: 'Łączniki e-mail i SMS',
  tab_social: 'Łączniki społecznościowe',
  connector_name: 'Nazwa łącznika',
  demo_tip:
    'Maksymalna liczba wiadomości dozwolona dla tego Łącznika demonstracyjnego wynosi 100 i nie jest zalecana do wdrożenia w środowisku produkcyjnym.',
  social_demo_tip:
    'Łącznik demonstracyjny został zaprojektowany wyłącznie dla celów demonstracyjnych i nie jest zalecany do wdrożenia w środowisku produkcyjnym.',
  connector_type: 'Typ',
  placeholder_title: 'Łącznik społecznościowy',
  placeholder_description:
    'Logto dostarczył wiele powszechnie używanych łączników społecznościowych, tymczasem możesz utworzyć własne z wykorzystaniem standardowych protokołów.',
  save_and_done: 'Zapisz i zakończ',
  type: {
    email: 'Łącznik e-mail',
    sms: 'Łącznik SMS',
    social: 'Łącznik społecznościowy',
  },
  setup_title: {
    email: 'Skonfiguruj łącznik e-mail',
    sms: 'Skonfiguruj łącznik SMS',
    social: 'Dodaj łącznik społecznościowy',
  },
  guide: {
    subtitle: 'Przewodnik krok po kroku do konfiguracji Twojego łącznika',
    general_setting: 'Ustawienia ogólne',
    parameter_configuration: 'Konfiguracja parametrów',
    test_connection: 'Testuj połączenie',
    name: 'Nazwa przycisku logowania społecznościowego',
    name_placeholder: 'Wpisz nazwę przycisku logowania społecznościowego',
    name_tip:
      'Nazwa przycisku łącznika będzie wyświetlana jako "Kontynuuj z {{name}}." Uwzględnij długość nazwy, gdyż może stać się zbyt długa.',
    connector_logo: 'Logo łącznika',
    connector_logo_tip: 'Logo będzie wyświetlane na przycisku logowania łącznika.',
    target: 'Nazwa dostawcy tożsamości',
    target_placeholder: 'Wpisz nazwę dostawcy tożsamości łącznika',
    target_tip:
      'Wartość „Nazwy dostawcy tożsamości” może być unikalnym ciągiem identyfikującym, który odróżnia Twoje tożsamości społecznościowe.',
    target_tip_standard:
      'Wartość „Nazwy dostawcy tożsamości” może być unikalnym ciągiem identyfikującym, który odróżnia Twoje tożsamości społecznościowe. Po utworzeniu łącznika nie możesz go zmienić.',
    target_tooltip:
      '„Nazwa dostawcy tożsamości” w łącznikach społecznościowych Logto odnosi się do "źródła" Twoich tożsamości społecznościowych. W projektowaniu Logto nie akceptujemy tych samych „Nazw dostawców tożsamości” konkretnej platformy, aby uniknąć konfliktów. Powinieneś bardzo uważać przed dodaniem łącznika, ponieważ NIE MOŻESZ zmienić jego wartości po utworzeniu. <a>Dowiedz się więcej</a>',
    target_conflict:
      'Wprowadzona nazwa IdP pasuje do istniejącego łącznika <span>nazwa</span>. Użycie tej samej nazwy IdP może spowodować nieoczekiwane zachowanie logowania, gdzie użytkownicy mogą uzyskać dostęp do tego samego konta za pośrednictwem dwóch różnych łączników.',
    target_conflict_line2:
      'Jeśli chcesz zastąpić aktualny łącznik tym samym dostawcą tożsamości i umożliwić poprzednim użytkownikom logowanie bez rejestracji ponownie, usuń łącznik <span>nazwa</span> i utwórz nowy z tą samą „Nazwą dostawcy tożsamości”.',
    target_conflict_line3:
      'Jeśli chcesz połączyć się z innym dostawcą tożsamości, zmodyfikuj „Nazwę dostawcy tożsamości” i kontynuuj.',
    config: 'Wprowadź swój JSON konfiguracji',
    sync_profile: 'Synchronizuj informacje profilowe',
    sync_profile_only_at_sign_up: 'Synchronizuj tylko podczas rejestracji',
    sync_profile_each_sign_in: 'Zawsze wykonaj synchronizację przy każdym logowaniu',
    sync_profile_tip:
      'Synchronizuje podstawowy profil z dostawcy usług społecznościowych, takie jak nazwy użytkowników i ich awatary.',
    enable_token_storage: {
      title: 'Przechowuj tokeny do trwałego dostępu do API',
      description:
        'Przechowuj tokeny dostępu i odświeżania w Tajnej Skrytce. Pozwala to na zautomatyzowane wywołania API bez powtarzającej się zgody użytkownika. Przykład: pozwól swojemu Agentowi AI dodawać wydarzenia do Kalendarza Google z trwałym upoważnieniem. <a>Dowiedz się, jak wywoływać zewnętrzne API</a>',
    },
    callback_uri: 'URI przekierowania (URI zwrotu)',
    callback_uri_description:
      'URI przekierowania to miejsce, do którego użytkownicy są kierowani po autoryzacji społecznościowej. Dodaj ten adres URI do konfiguracji swojego IdP.',
    callback_uri_custom_domain_description:
      'Jeśli używasz w Logto wielu <a>domen niestandardowych</a>, dodaj wszystkie odpowiadające im adresy URI zwrotu do IdP, aby logowanie społecznościowe działało w każdej domenie.\n\nDomyślna domena Logto (*.logto.app) jest zawsze ważna - uwzględnij ją tylko wtedy, gdy chcesz obsługiwać logowania także w tej domenie.',
    acs_url: 'Assertion consumer service URL',
  },
  platform: {
    universal: 'Uniwersalny',
    web: 'Web',
    native: 'Natywny',
  },
  add_multi_platform: 'obsługuje wiele platform, wybierz platformę, aby kontynuować',
  drawer_title: 'Poradnik łącznika',
  drawer_subtitle: 'Postępuj zgodnie z instrukcjami, aby zintegrować swój łącznik',
  unknown: 'Nieznany Łącznik',
  standard_connectors: 'Standardowe łączniki',
  create_form: {
    third_party_connectors:
      'Zintegruj zewnętrznych dostawców, aby szybko zalogować się przez nich społecznościowo, połączyć konta społecznościowe i uzyskać dostęp do API. <a>Dowiedz się więcej</a>',
    standard_connectors:
      'Lub możesz dostosować swój łącznik społecznościowy, korzystając ze standardowego protokołu.',
  },
};

export default Object.freeze(connectors);
