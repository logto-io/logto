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
    favicon: 'Favicon',
    logo_image_url: 'Adres URL obrazka logo aplikacji',
    logo_image_url_placeholder: 'https://twoja.domena.cdn/logo.png',
    dark_logo_image_url: 'Adres URL obrazka logo aplikacji (Ciemny)',
    dark_logo_image_url_placeholder: 'https://twoja.domena.cdn/logo-ciemny.png',
    logo_image: 'Logo aplikacji',
    dark_logo_image: 'Logo aplikacji (Ciemny)',
    logo_image_error: 'Logo aplikacji: {{error}}',
    favicon_error: 'Favicon: {{error}}',
  },
  custom_css: {
    title: 'Niestandardowe CSS',
    css_code_editor_title: 'Dostosuj swój interfejs użytkownika niestandardowym CSS',
    css_code_editor_description1: 'Zobacz przykład niestandardowego CSS.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Dowiedz się więcej',
    css_code_editor_content_placeholder:
      'Wprowadź swoje niestandardowe CSS, aby dostosować style czegokolwiek do swoich dokładnych specyfikacji. Wyraź swoją kreatywność i wyróżnij swój interfejs użytkownika.',
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
