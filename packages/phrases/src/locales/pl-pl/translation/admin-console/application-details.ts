const application_details = {
  page_title: 'Szczegóły aplikacji',
  back_to_applications: 'Powrót do aplikacji',
  check_guide: 'Sprawdź przewodnik',
  settings: 'Ustawienia',
  settings_description:
    'Aplikacje są używane do identyfikowania Twoich aplikacji w Logto dla OIDC, doświadczenia logowania, dzienników audytowych itp.',
  /** UNTRANSLATED */
  endpoints_and_credentials: 'Endpoints & Credentials',
  /** UNTRANSLATED */
  endpoints_and_credentials_description:
    'Use the following endpoints and credentials to set up the OIDC connection in your application.',
  /** UNTRANSLATED */
  refresh_token_settings: 'Refresh token',
  /** UNTRANSLATED */
  refresh_token_settings_description: 'Manage the refresh token rules for this application.',
  application_roles: 'Role',
  machine_logs: 'Dzienniki maszynowe',
  application_name: 'Nazwa aplikacji',
  application_name_placeholder: 'Moja aplikacja',
  description: 'Opis',
  description_placeholder: 'Wpisz opis swojej aplikacji',
  config_endpoint: 'Konfiguracja punktu końcowego OpenID Provider',
  authorization_endpoint: 'Endpoint autoryzacji',
  authorization_endpoint_tip:
    'Endpoint wykorzystywany do autentykacji i autoryzacji. Używany jest dla OpenID Connect <a>Autentykacji</a>.',
  /** UNTRANSLATED */
  show_endpoint_details: 'Show endpoint details',
  /** UNTRANSLATED */
  hide_endpoint_details: 'Hide endpoint details',
  logto_endpoint: 'Logto endpoint',
  application_id: 'ID aplikacji',
  application_id_tip:
    'Unikalny identyfikator aplikacji, który jest zwykle generowany przez Logto. Oznacza również „<a>client_id</a>” w OpenID Connect.',
  application_secret: 'Tajny kod aplikacji',
  redirect_uri: 'Adres URL przekierowania',
  redirect_uris: 'Adresy URL przekierowania',
  redirect_uri_placeholder: 'https://twoja.strona.com/aplikacja',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'Adres URL, na który użytkownik jest przekierowywany po zalogowaniu się (zarówno pozytywnym, jak i negatywnym). Zobacz OpenID Connect <a>AuthRequest</a> po więcej informacji.',
  post_sign_out_redirect_uri: 'Adres URL przekierowania po wylogowaniu',
  post_sign_out_redirect_uris: 'Adresy URL przekierowania po wylogowaniu',
  post_sign_out_redirect_uri_placeholder: 'https://twoja.strona.com/strona-startowa',
  post_sign_out_redirect_uri_tip:
    'Adres URL, na który użytkownik jest przekierowywany po wylogowaniu (opcjonalnie). W niektórych rodzajach aplikacji może nie mieć to praktycznego wpływu.',
  cors_allowed_origins: 'Dozwolone źródła CORS',
  cors_allowed_origins_placeholder: 'https://twoja.strona.com',
  cors_allowed_origins_tip:
    'Domyślnie dozwolone będą wszystkie źródła z adresów URL przekierowania. Zazwyczaj nie wymaga to żadnych działań. Zobacz dokumentację <a>MDN</a> dla szczegółowych informacji.',
  token_endpoint: 'Endpoint Tokena',
  user_info_endpoint: 'Endpoint Informacji o użytkowniku',
  enable_admin_access: 'Włącz dostęp administratora',
  enable_admin_access_label:
    'Włącz lub wyłącz dostęp do interfejsu API zarządzania. Po włączeniu możesz używać tokenów dostępu do wywoływania interfejsu API zarządzania w imieniu tej aplikacji.',
  always_issue_refresh_token: 'Zawsze wydawaj Refresh Token',
  always_issue_refresh_token_label:
    'Rozwiazanie tej konfiguracji pozwoli Logto zawsze wydawac cwiecze tokeny, bez wzgledu na to, czy w zadaniu autoryzacji zostal przedstawiony `prompt=consent`. Jednak ta praktyka jest odstraszana, chyba ze konieczne, jak nie jest w pelni kompatybilna z OpenID Connect i moze potencjalnie powodowac problemy.',
  refresh_token_ttl: 'Czas życia tokena odświeżania w dniach',
  refresh_token_ttl_tip:
    'Okres, przez który Token odświeżania można używać do żądania nowych tokenów dostępu, zanim wygaśnie i zostanie unieważniony. Wymaga to przedłużenia czasu życia tokenów żądania. ',
  rotate_refresh_token: 'Obróć token odświeżania',
  rotate_refresh_token_label:
    'Po włączeniu tej opcji Logto wydaje nowy Token odświeżania dla żądań tokenów, gdy upłynęło 70% oryginalnego czasu życia (TTL) lub spełnione są pewne warunki. <a>Dowiedz się więcej</a>',
  delete_description:
    'Ta operacja nie może zostać cofnięta. Skutkuje ona trwałym usunięciem aplikacji. Aby potwierdzić, wpisz nazwę aplikacji <span>{{name}}</span>.',
  enter_your_application_name: 'Wpisz nazwę swojej aplikacji',
  application_deleted: 'Aplikacja {{name}} została pomyślnie usunięta',
  redirect_uri_required: 'Musisz wpisać co najmniej jeden adres URL przekierowania',
  branding: {
    /** UNTRANSLATED */
    branding: 'Branding',
    /** UNTRANSLATED */
    branding_description:
      "Customize your application's display name and logo on the consent screen.",
    /** UNTRANSLATED */
    more_info: 'More info',
    /** UNTRANSLATED */
    more_info_description: 'Offer users more details about your application on the consent screen.',
    /** UNTRANSLATED */
    display_name: 'Display name',
    /** UNTRANSLATED */
    display_logo: 'Display logo',
    /** UNTRANSLATED */
    display_logo_dark: 'Display logo (dark)',
    /** UNTRANSLATED */
    terms_of_use_url: 'Application terms of use URL',
    /** UNTRANSLATED */
    privacy_policy_url: 'Application privacy policy URL',
  },
  roles: {
    name_column: 'Role',
    description_column: 'Opis',
    assign_button: 'Przypisz role',
    delete_description:
      'Ta akcja usunie tę rolę z tej aplikacji machine-to-machine. Rola ta nadal będzie istnieć, ale nie będzie już powiązana z tą aplikacją machine-to-machine.',
    deleted: '{{name}} został(a) pomyślnie usunięty(ą) z tego użytkownika.',
    assign_title: 'Przypisz role dla {{name}}',
    assign_subtitle: 'Autoryzuj {{name}} jedną lub więcej ról',
    assign_role_field: 'Przypisz role',
    role_search_placeholder: 'Wyszukaj według nazwy roli',
    added_text: '{{value, number}} dodane',
    assigned_app_count: '{{value, number}} aplikacje',
    confirm_assign: 'Przypisz role',
    role_assigned: 'Pomyślnie przypisano rolę(y)',
    search: 'Wyszukaj według nazwy roli, opisu lub ID',
    empty: 'Brak dostępnych ról',
  },
};

export default Object.freeze(application_details);
