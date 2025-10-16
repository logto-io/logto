import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Doświadczenie logowania',
  page_title_with_account: 'Logowanie i konto',
  title: 'Logowanie i konto',
  description:
    'Dostosuj przepływy uwierzytelniania i interfejs użytkownika, a także podglądaj gotowe rozwiązanie w czasie rzeczywistym.',
  tabs: {
    branding: 'Marka',
    sign_up_and_sign_in: 'Rejestracja i logowanie',
    collect_user_profile: 'Zbieraj profil użytkownika',
    account_center: 'Centrum konta',
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
    organization_logo_and_favicon: 'Logo organizacji i favicon',
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
  account_center: {
    title: 'Centrum konta',
    description: 'Dostosuj procesy centrum konta z wykorzystaniem interfejsów Logto.',
    enable_account_api: 'Włącz Account API',
    enable_account_api_description:
      'Włącz Account API, aby budować własne centrum konta i dać użytkownikom bezpośredni dostęp do API bez użycia Logto Management API.',
    field_options: {
      off: 'Off',
      edit: 'Edit',
      read_only: 'Read only',
      enabled: 'Włączone',
      disabled: 'Wyłączone',
    },
    sections: {
      account_security: {
        title: 'ACCOUNT SECURITY',
        description:
          'Manage access to the Account API, enabling users to view or edit their identity information and authentication factors after signing into the application. Users must verify their identity to get a valid 10-minute verification record ID before making these security-related changes.',
        groups: {
          identifiers: {
            title: 'Identifiers',
          },
          authentication_factors: {
            title: 'Authentication factors',
          },
        },
      },
      user_profile: {
        title: 'USER PROFILE',
        description:
          'Manage access to the Account API, enabling users to view or edit basic or custom profile data after signing into the application.',
        groups: {
          profile_data: {
            title: 'Profile data',
          },
        },
      },
      secret_vault: {
        title: 'TAJNY SEJF',
        description:
          'Dla złączy społecznościowych i korporacyjnych, bezpieczne przechowywanie tokenów dostępu stron trzecich w celu wywołania ich interfejsów API (np. dodawanie wydarzeń do Kalendarza Google).',
        third_party_token_storage: {
          title: 'Token strony trzeciej',
          third_party_access_token_retrieval: 'Token strony trzeciej',
          third_party_token_tooltip:
            'Aby przechowywać tokeny, możesz włączyć to w ustawieniach odpowiedniego złącza społecznościowego lub korporacyjnego.',
          third_party_token_description:
            'Po włączeniu Account API pobieranie tokenów stron trzecich jest automatycznie aktywowane.',
        },
      },
    },
    fields: {
      email: 'Email address',
      phone: 'Phone number',
      social: 'Social identities',
      password: 'Password',
      mfa: 'Multi-factor authentication',
      mfa_description: 'Let users manage their MFA methods from the account center.',
      username: 'Username',
      name: 'Name',
      avatar: 'Avatar',
      profile: 'Profile',
      profile_description: 'Control access to structured profile attributes.',
      custom_data: 'Custom data',
      custom_data_description: 'Control access to custom JSON data stored on the user.',
    },
    webauthn_related_origins: 'Powiązane źródła WebAuthn',
    webauthn_related_origins_description:
      'Dodaj domeny swoich aplikacji frontendowych, które mogą rejestrować klucze dostępu za pośrednictwem API konta.',
    webauthn_related_origins_error: 'Źródło musi zaczynać się od https:// lub http://',
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'Nie ustawiono jeszcze łącznika SMS. Przed zakończeniem konfiguracji użytkownicy nie będą mogli się zalogować przy użyciu tej metody. <a>{{link}}</a> w sekcji „Łączniki"',
    no_connector_email:
      'Nie ustawiono jeszcze łącznika e-mail. Przed zakończeniem konfiguracji użytkownicy nie będą mogli się zalogować przy użyciu tej metody. <a>{{link}}</a> w sekcji „Łączniki"',
    no_connector_social:
      'Nie skonfigurowałeś jeszcze żadnego konektora społecznościowego. Najpierw dodaj konektory, aby zastosować metody logowania społecznościowego. <a>{{link}}</a> w "Konektory".',
    no_connector_email_account_center:
      'Nie ustawiono jeszcze łącznika e-mail. Skonfiguruj go w <a>„Łączniki e-mail i SMS"</a>.',
    no_connector_sms_account_center:
      'Nie ustawiono jeszcze łącznika SMS. Skonfiguruj go w <a>„Łączniki e-mail i SMS"</a>.',
    no_connector_social_account_center:
      'Nie ustawiono jeszcze łącznika społecznościowego. Skonfiguruj go w <a>„Łączniki społecznościowe"</a>.',
    no_mfa_factor:
      'Nie ustawiono jeszcze czynnika MFA. <a>{{link}}</a> w „Uwierzytelnianie wieloskładnikowe".',
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
    forgot_password_migration_notice:
      'Zaktualizowaliśmy weryfikację zapomnianego hasła, aby wspierać niestandardowe metody. Wcześniej było to automatycznie określane przez Twoje łączniki Email i SMS. Kliknij <strong>Potwierdź</strong>, aby zakończyć aktualizację.',
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
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
