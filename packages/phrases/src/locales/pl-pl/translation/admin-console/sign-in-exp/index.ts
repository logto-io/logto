import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Doświadczenie logowania',
  title: 'Doświadczenie logowania',
  description:
    'Dostosuj interfejs logowania, aby pasował do Twojej marki i wyświetlaj w czasie rzeczywistym',
  tabs: {
    branding: 'Marka',
    sign_up_and_sign_in: 'Rejestracja i logowanie',
    content: 'Treść',
    password_policy: 'Polityka hasła',
  },
  welcome: {
    title: 'Dostosuj swoje doświadczenie logowania',
    description:
      'Szybkie uruchomienie Twojego pierwszego logowania. Ten przewodnik po krokach przeprowadzi Cię przez wszystkie niezbędne ustawienia.',
    get_started: 'Rozpocznij',
    apply_remind:
      'Należy pamiętać, że doświadczenie logowania będzie stosowane do wszystkich aplikacji w tej sekcji.',
  },
  color: {
    title: 'KOLOR',
    primary_color: 'Kolor marki',
    dark_primary_color: 'Kolor marki (ciemny)',
    dark_mode: 'Włącz tryb ciemny',
    dark_mode_description:
      'Twoja aplikacja będzie miała automatycznie wygenerowany szablon trybu ciemnego na podstawie koloru marki i algorytmu Logto. Możesz go swobodnie dostosować.',
    dark_mode_reset_tip: 'Przelicz kolor trybu ciemnego na podstawie koloru marki.',
    reset: 'Przelicz',
  },
  branding: {
    title: 'OPCJE BRANDINGU',
    ui_style: 'Styl',
    with_light: '{{value}}',
    with_dark: '{{value}} (dark)',
    app_logo_and_favicon: 'Logo aplikacji i favicon',
    company_logo_and_favicon: 'Logo firmy i favicon',
  },
  branding_uploads: {
    app_logo: {
      title: 'Logo aplikacji',
      url: 'URL logo aplikacji',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo aplikacji: {{error}}',
    },
    company_logo: {
      title: 'Logo firmy',
      url: 'URL logo firmy',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo firmy: {{error}}',
    },
    organization_logo: {
      title: 'Prześlij obraz',
      url: 'URL logo organizacji',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo organizacji: {{error}}',
    },
    connector_logo: {
      title: 'Prześlij obraz',
      url: 'URL logo złącza',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo złącza: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'URL favicon',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: 'Niestandardowy interfejs użytkownika',
    css_code_editor_title: 'Niestandardowy CSS',
    css_code_editor_description1: 'Zobacz przykład niestandardowego CSS.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Dowiedz się więcej',
    css_code_editor_content_placeholder:
      'Wpisz swój niestandardowy CSS, aby dostosować style wszystkiego do swoich specyfikacji. Wyraź swoją kreatywność i spraw, by Twój interfejs użytkownika był wyjątkowy.',
    bring_your_ui_title: 'Przynieś swój interfejs użytkownika',
    bring_your_ui_description:
      'Prześlij skompresowany pakiet (.zip), aby zastąpić predefiniowany interfejs użytkownika Logto swoim własnym kodem. <a>Dowiedz się więcej</a>',
    preview_with_bring_your_ui_description:
      'Twoje niestandardowe zasoby interfejsu użytkownika zostały pomyślnie przesłane i są teraz dostępne. W rezultacie wbudowane okno podglądu zostało wyłączone.\nAby przetestować swoje spersonalizowane UI logowania, kliknij przycisk "Podgląd na żywo", aby otworzyć go w nowej karcie przeglądarki.',
  },
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      'Nie ustawiono jeszcze łącznika SMS. Przed zakończeniem konfiguracji użytkownicy nie będą mogli się zalogować przy użyciu tej metody. <a>{{link}}</a> w sekcji „Łączniki“',
    no_connector_email:
      'Nie ustawiono jeszcze łącznika e-mail. Przed zakończeniem konfiguracji użytkownicy nie będą mogli się zalogować przy użyciu tej metody. <a>{{link}}</a> w sekcji „Łączniki“',
    no_connector_social:
      'Nie skonfigurowałeś jeszcze żadnego konektora społecznościowego. Najpierw dodaj konektory, aby zastosować metody logowania społecznościowego. <a>{{link}}</a> w "Konektory".',
    setup_link: 'Konfiguracja',
  },
  save_alert: {
    description:
      'Wdrażasz nowe procedury logowania i rejestracji. Wszyscy Twoi użytkownicy mogą być dotknięci nową konfiguracją. Czy na pewno zdecydowałeś się na zmiany?',
    before: 'Przed',
    after: 'Po',
    sign_up: 'Rejestracja',
    sign_in: 'Logowanie',
    social: 'Społecznościowy',
  },
  preview: {
    title: 'Podgląd logowania',
    live_preview: 'Podgląd na żywo',
    live_preview_tip: 'Zapisz, aby obejrzeć zmiany',
    native: 'Aplikacja natywna',
    desktop_web: 'Wersja desktopowa',
    mobile_web: 'Wersja mobilna',
    desktop: 'Komputer',
    mobile: 'Telefon',
  },
};

export default Object.freeze(sign_in_exp);
