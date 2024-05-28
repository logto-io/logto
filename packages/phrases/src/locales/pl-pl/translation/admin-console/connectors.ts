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
  connector_status: 'Doświadczenie logowania',
  connector_status_in_use: 'W użyciu',
  connector_status_not_in_use: 'Nie w użyciu',
  not_in_use_tip: {
    content:
      'Nie w użyciu oznacza, że Twoje doświadczenie logowania nie użyło tej metody logowania. <a>{{link}}</a> aby dodać tę metodę logowania.',
    go_to_sie: 'Przejdź do doświadczenia logowania',
  },
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
    logo: 'Logo URL łącznika społecznościowego',
    logo_placeholder: 'https://your.cdn.domain/logo.png',
    logo_tip:
      'Obraz logo zostanie wyświetlony na łączniku. Uzyskaj publicznie dostępny link do obrazu i wklej tutaj link.',
    logo_dark: 'Logo URL łącznika społecznościowego (tryb ciemny)',
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip:
      'Ustaw logo łącznika dla trybu ciemnego po jego włączeniu w Doświadczeniu logowania w Konsoli Admina.',
    logo_dark_collapse: 'Zwiń',
    logo_dark_show: 'Pokaż ustawienia logo dla trybu ciemnego',
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
    callback_uri: 'URI zwrotu (Callback)',
    callback_uri_description:
      'Nazywany także URI przekierowania, to URI w Logto, do którego użytkownicy zostaną przesłani po autoryzacji społecznej; skopiuj i wklej na stronie konfiguracyjnej dostawcy usług społecznościowych.',
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
};

export default Object.freeze(connectors);
