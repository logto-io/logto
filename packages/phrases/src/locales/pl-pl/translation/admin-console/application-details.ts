const application_details = {
  page_title: 'Szczegóły aplikacji',
  back_to_applications: 'Powrót do Aplikacji',
  check_guide: 'Sprawdź przewodnik',
  settings: 'Ustawienia',
  settings_description:
    'Aplikacje są używane do identyfikowania Twoich aplikacji w Logto dla OIDC, doświadczenia logowania, dzienników audytowych itp.',
  advanced_settings: 'Zaawansowane ustawienia',
  advanced_settings_description:
    'Zaawansowane ustawienia obejmują związane z OIDC terminy. Możesz sprawdzić punkt końcowy Token dla bardziej szczegółowych informacji.',
  application_name: 'Nazwa aplikacji',
  application_name_placeholder: 'Moja aplikacja',
  description: 'Opis',
  description_placeholder: 'Wpisz opis swojej aplikacji',
  authorization_endpoint: 'Endpoint autoryzacji',
  authorization_endpoint_tip:
    'Endpoint wykorzystywany do autentykacji i autoryzacji. Używany jest dla OpenID Connect <a>Autentykacji</a>.',
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
  id_token_expiration: 'Ważność ID Token',
  refresh_token_expiration: 'Ważność Token odświeżania',
  token_endpoint: 'Endpoint Tokena',
  user_info_endpoint: 'Endpoint Informacji o użytkowniku',
  enable_admin_access: 'Włącz dostęp administratora',
  enable_admin_access_label:
    'Włącz lub wyłącz dostęp do interfejsu API zarządzania. Po włączeniu możesz używać tokenów dostępu do wywoływania interfejsu API zarządzania w imieniu tej aplikacji.',
  delete_description:
    'Ta operacja nie może zostać cofnięta. Skutkuje ona trwałym usunięciem aplikacji. Aby potwierdzić, wpisz nazwę aplikacji <span>{{name}}</span>.',
  enter_your_application_name: 'Wpisz nazwę swojej aplikacji',
  application_deleted: 'Aplikacja {{name}} została pomyślnie usunięta',
  redirect_uri_required: 'Musisz wpisać co najmniej jeden adres URL przekierowania',
};

export default application_details;
