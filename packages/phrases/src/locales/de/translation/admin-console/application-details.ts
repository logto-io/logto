const application_details = {
  page_title: 'Anwendungsdaten',
  back_to_applications: 'Zurück zu Anwendungen',
  check_guide: 'Zur Anleitung',
  settings: 'Einstellungen',
  settings_description:
    'Anwendungen werden verwendet, um Ihre Anwendungen in Logto für OIDC, Anmeldeerfahrung, Audit-Logs usw. zu identifizieren.',
  /** UNTRANSLATED */
  advanced_settings: 'Advanced settings',
  advanced_settings_description:
    'Erweiterte Einstellungen beinhalten OIDC-bezogene Begriffe. Sie können den Token-Endpunkt für weitere Informationen überprüfen.',
  /** UNTRANSLATED */
  application_roles: 'Roles',
  /** UNTRANSLATED */
  machine_logs: 'Machine logs',
  application_name: 'Anwendungsname',
  application_name_placeholder: 'Meine App',
  description: 'Beschreibung',
  description_placeholder: 'Gib eine Beschreibung ein',
  config_endpoint: 'OpenID Provider Konfigurations-Endpunkt',
  authorization_endpoint: 'Autorisierungs-Endpoint',
  authorization_endpoint_tip:
    'Der Endpoint, der für die Authentifizierung und <a>Authorisierung</a> via OpenID Connect verwendet wird.',
  logto_endpoint: 'Logto endpoint',
  application_id: 'App ID',
  application_id_tip:
    'Die eindeutige Anwendungs-ID, die normalerweise von Logto generiert wird. Es steht auch für "<a>client_id</a>" in OpenID Connect.',
  application_secret: 'App Geheimnis',
  redirect_uri: 'Umleitungs-URI',
  redirect_uris: 'Umleitungs-URIs',
  redirect_uri_placeholder: 'https://deine.website.de/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'URI, zu der der Benutzer nach der Anmeldung (egal ob erfolgreich oder nicht) weitergeleitet wird. Siehe OpenID Connect <a>AuthRequest</a> für weitere Informationen.',
  post_sign_out_redirect_uri: 'Post Sign-out Umleitungs-URI',
  post_sign_out_redirect_uris: 'Post Sign-out Umleitungs-URIs',
  post_sign_out_redirect_uri_placeholder: 'https://deine.website.de/home',
  post_sign_out_redirect_uri_tip:
    'URI, zu der der Benutzer nach dem Abmelden weitergeleitet wird (optional). Hat bei einigen Anwendungstypen keine Auswirkungen.',
  cors_allowed_origins: 'CORS zugelassene Ursprünge',
  cors_allowed_origins_placeholder: 'https://your.website.de',
  cors_allowed_origins_tip:
    'Standardmäßig sind alle Umleitungs-URI-Ursprünge zulässig. Normalerweise ist dieses Feld nicht erforderlich. Siehe die <a>MDN-Dokumentation<a> für detaillierte Informationen.',
  token_endpoint: 'Token-Endpunkt',
  user_info_endpoint: 'Benutzerinformations-Endpunkt',
  enable_admin_access: 'Admin-Zugang aktivieren',
  enable_admin_access_label:
    'Zugang zur Management API aktivieren oder deaktivieren. Wenn aktiviert, können Access Tokens verwendet werden, um die Management API im Namen der Anwendung aufzurufen.',
  always_issue_refresh_token: 'Immer den Refresh Token ausgeben',
  always_issue_refresh_token_label:
    'Durch Aktivieren dieser Konfiguration kann Logto immer Refresh Tokens ausgeben, unabhängig davon, ob in der Authentifizierungsanforderung "prompt=consent" angegeben ist. Diese Praxis wird jedoch nur dann empfohlen, wenn es notwendig ist, da sie nicht mit OpenID Connect kompatibel ist und möglicherweise Probleme verursacht.',
  refresh_token_ttl: 'Ablaufzeit des Refresh Tokens in Tagen',
  refresh_token_ttl_tip:
    'Die Dauer, für die ein Refresh Token verwendet werden kann, um neue Zugriffstoken anzufordern, bevor es abläuft und ungültig wird. Token-Anfragen erweitern die Verfallszeit des Refresh Tokens auf diesen Wert.',
  rotate_refresh_token: 'Refresh Token drehen',
  rotate_refresh_token_label:
    'Wenn diese Option aktiviert ist, wird Logto für Tokenanfragen ein neues Refresh Token ausgeben, wenn 70% der ursprünglichen Zeit bis zur Ausführung (TTL) verstrichen sind oder bestimmte Bedingungen erfüllt sind. <a>Erfahren Sie mehr</a>',
  delete_description:
    'Diese Aktion kann nicht rückgängig gemacht werden. Die Anwendung wird permanent gelöscht. Bitte gib den Anwendungsnamen <span>{{name}}</span> zur Bestätigung ein.',
  enter_your_application_name: 'Gib einen Anwendungsnamen ein',
  application_deleted: 'Anwendung {{name}} wurde erfolgreich gelöscht',
  redirect_uri_required: 'Gib mindestens eine Umleitungs-URI an',
  roles: {
    /** UNTRANSLATED */
    name_column: 'Role',
    /** UNTRANSLATED */
    description_column: 'Description',
    /** UNTRANSLATED */
    assign_button: 'Assign Roles',
    /** UNTRANSLATED */
    delete_description:
      'This action will remove this role from this machine-to-machine app. The role itself will still exist, but it will no longer be associated with this machine-to-machine app.',
    /** UNTRANSLATED */
    deleted: '{{name}} was successfully removed from this user.',
    /** UNTRANSLATED */
    assign_title: 'Assign roles to {{name}}',
    /** UNTRANSLATED */
    assign_subtitle: 'Authorize {{name}} one or more roles',
    /** UNTRANSLATED */
    assign_role_field: 'Assign roles',
    /** UNTRANSLATED */
    role_search_placeholder: 'Search by role name',
    /** UNTRANSLATED */
    added_text: '{{value, number}} added',
    /** UNTRANSLATED */
    assigned_user_count: '{{value, number}} users',
    /** UNTRANSLATED */
    confirm_assign: 'Assign roles',
    /** UNTRANSLATED */
    role_assigned: 'Successfully assigned role(s)',
    /** UNTRANSLATED */
    search: 'Search by role name, description or ID',
    /** UNTRANSLATED */
    empty: 'No role available',
  },
};

export default Object.freeze(application_details);
