const application_details = {
  page_title: 'Anwendungsdaten',
  back_to_applications: 'Zurück zu Anwendungen',
  check_guide: 'Zur Anleitung',
  settings: 'Einstellungen',
  settings_description:
    'Anwendungen werden verwendet, um Ihre Anwendungen in Logto für OIDC, Anmeldeerfahrung, Audit-Logs usw. zu identifizieren.',
  /** UNTRANSLATED */
  endpoints_and_credentials: 'Endpoints & Credentials',
  /** UNTRANSLATED */
  endpoints_and_credentials_description:
    'Use the following endpoints and credentials to set up the OIDC connection in your application.',
  /** UNTRANSLATED */
  refresh_token_settings: 'Refresh token',
  /** UNTRANSLATED */
  refresh_token_settings_description: 'Manage the refresh token rules for this application.',
  application_roles: 'Rollen',
  machine_logs: 'Maschinenprotokolle',
  application_name: 'Anwendungsname',
  application_name_placeholder: 'Meine App',
  description: 'Beschreibung',
  description_placeholder: 'Gib eine Beschreibung ein',
  config_endpoint: 'OpenID Provider Konfigurations-Endpunkt',
  authorization_endpoint: 'Autorisierungs-Endpoint',
  authorization_endpoint_tip:
    'Der Endpoint, der für die Authentifizierung und <a>Authorisierung</a> via OpenID Connect verwendet wird.',
  /** UNTRANSLATED */
  show_endpoint_details: 'Show endpoint details',
  /** UNTRANSLATED */
  hide_endpoint_details: 'Hide endpoint details',
  logto_endpoint: 'Logto-Endpunkt',
  application_id: 'App-ID',
  application_id_tip:
    'Die eindeutige Anwendungs-ID, die normalerweise von Logto generiert wird. Es steht auch für "<a>client_id</a>" in OpenID Connect.',
  application_secret: 'App-Geheimnis',
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
    'Standardmäßig sind alle Umleitungs-URI-Ursprünge zulässig. Normalerweise ist dieses Feld nicht erforderlich. Siehe die <a>MDN-Dokumentation<a>für detaillierte Informationen.',
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
    user_permissions: 'Personal user information',
    /** UNTRANSLATED */
    organization_permissions: 'Organization access',
    /** UNTRANSLATED */
    table_name: 'Grant permissions',
    /** UNTRANSLATED */
    field_name: 'permission',
    /** UNTRANSLATED */
    delete_text: 'Remove permission',
    /** UNTRANSLATED */
    permission_delete_confirm:
      'This action will withdraw the permissions granted to the third-party app, preventing it from requesting user authorization for specific data types. Are you sure you want to continue?',
  },
  roles: {
    name_column: 'Rolle',
    description_column: 'Beschreibung',
    assign_button: 'Rollen zuweisen',
    delete_description:
      'Diese Aktion entfernt diese Rolle von dieser Maschinen-zu-Maschinen-App. Die Rolle selbst existiert weiterhin, ist aber nicht mehr mit dieser Maschinen-zu-Maschinen-App verknüpft.',
    deleted: '{{name}} wurde erfolgreich von diesem Benutzer entfernt.',
    assign_title: 'Rollen an {{name}} zuweisen',
    assign_subtitle: 'Autorisiere {{name}} mit einer oder mehreren Rollen',
    assign_role_field: 'Rollen zuweisen',
    role_search_placeholder: 'Nach Rollennamen suchen',
    added_text: '{{value, number}} hinzugefügt',
    assigned_app_count: '{{value, number}} Anwendungen',
    confirm_assign: 'Rollen zuweisen',
    role_assigned: 'Rolle(n) erfolgreich zugewiesen',
    search: 'Nach Rollennamen, Beschreibung oder ID suchen',
    empty: 'Keine Rollen verfügbar',
  },
};

export default Object.freeze(application_details);
