const application_details = {
  page_title: 'Szczegóły aplikacji',
  back_to_applications: 'Powrót do aplikacji',
  check_guide: 'Sprawdź przewodnik',
  settings: 'Ustawienia',
  /** UNTRANSLATED */
  settings_description:
    'An "Application" is a registered software or service that can access user info or act for a user. Applications help recognize who’s asking for what from Logto and handle the sign-in and permission. Fill in the required fields for authentication.',
  /** UNTRANSLATED */
  integration: 'Integration',
  /** UNTRANSLATED */
  integration_description:
    "Deploy with Logto secure workers, powered by Cloudflare's edge network for top-tier performance and 0ms cold starts worldwide.",
  /** UNTRANSLATED */
  service_configuration: 'Service configuration',
  /** UNTRANSLATED */
  service_configuration_description: 'Complete the necessary configurations in your service.',
  /** UNTRANSLATED */
  session: 'Session',
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
  /** UNTRANSLATED */
  app_domain_description_1:
    'Feel free to use your domain with {{domain}} powered by Logto, which is permanently valid.',
  /** UNTRANSLATED */
  app_domain_description_2:
    'Feel free to utilize your domain <domain>{{domain}}</domain> which is permanently valid.',
  /** UNTRANSLATED */
  custom_rules: 'Custom authentication rules',
  /** UNTRANSLATED */
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  /** UNTRANSLATED */
  custom_rules_description:
    'Set rules with regular expressions for authentication-required routes. Default: full-site protection if left blank.',
  /** UNTRANSLATED */
  authentication_routes: 'Authentication routes',
  /** UNTRANSLATED */
  custom_rules_tip:
    "Here are two case scenarios:<ol><li>To only protect routes '/admin' and '/privacy' with authentication: ^/(admin|privacy)/.*</li><li>To exclude JPG images from authentication: ^(?!.*\\.jpg$).*$</li></ol>",
  /** UNTRANSLATED */
  authentication_routes_description:
    'Redirect your authentication button using the specified routes. Note: These routes are irreplaceable.',
  /** UNTRANSLATED */
  protect_origin_server: 'Protect your origin server',
  /** UNTRANSLATED */
  protect_origin_server_description:
    'Ensure to protect your origin server from direct access. Refer to the guide for more <a>detailed instructions</a>.',
  /** UNTRANSLATED */
  session_duration: 'Session duration (days)',
  /** UNTRANSLATED */
  try_it: 'Try it',
  branding: {
    /** UNTRANSLATED */
    name: 'Branding',
    /** UNTRANSLATED */
    description: "Customize your application's display name and logo on the consent screen.",
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
  permissions: {
    /** UNTRANSLATED */
    name: 'Permissions',
    /** UNTRANSLATED */
    description:
      'Select the permissions that the third-party application requires for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_permissions: 'Personal user data',
    /** UNTRANSLATED */
    organization_permissions: 'Organization access',
    /** UNTRANSLATED */
    table_name: 'Grant permissions',
    /** UNTRANSLATED */
    field_name: 'Permission',
    /** UNTRANSLATED */
    field_description: 'Displayed in the consent screen',
    /** UNTRANSLATED */
    delete_text: 'Remove permission',
    /** UNTRANSLATED */
    permission_delete_confirm:
      'This action will withdraw the permissions granted to the third-party app, preventing it from requesting user authorization for specific data types. Are you sure you want to continue?',
    /** UNTRANSLATED */
    permissions_assignment_description:
      'Select the permissions the third-party application requests for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_profile: 'User data',
    /** UNTRANSLATED */
    api_permissions: 'API permissions',
    /** UNTRANSLATED */
    organization: 'Organization permissions',
    /** UNTRANSLATED */
    user_permissions_assignment_form_title: 'Add the user profile permissions',
    /** UNTRANSLATED */
    organization_permissions_assignment_form_title: 'Add the organization permissions',
    /** UNTRANSLATED */
    api_resource_permissions_assignment_form_title: 'Add the API resource permissions',
    /** UNTRANSLATED */
    user_data_permission_description_tips:
      'You can modify the description of the personal user data permissions via "Sign-in Experience > Content > Manage Language"',
    /** UNTRANSLATED */
    permission_description_tips:
      'When Logto is used as an Identity Provider (IdP) for authentication in third-party apps, and users are asked for authorization, this description appears on the consent screen.',
    /** UNTRANSLATED */
    user_title: 'User',
    /** UNTRANSLATED */
    user_description:
      'Select the permissions requested by the third-party app for accessing specific user data.',
    /** UNTRANSLATED */
    grant_user_level_permissions: 'Grant permissions of user data',
    /** UNTRANSLATED */
    organization_title: 'Organization',
    /** UNTRANSLATED */
    organization_description:
      'Select the permissions requested by the third-party app for accessing specific organization data.',
    /** UNTRANSLATED */
    grant_organization_level_permissions: 'Grant permissions of organization data',
    /** UNTRANSLATED */
    add_permissions_for_organization:
      'Add the API resource permissions used in the "Organization template"',
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
