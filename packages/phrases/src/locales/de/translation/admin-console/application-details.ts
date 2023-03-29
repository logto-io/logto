const application_details = {
  page_title: 'Anwendungsdaten',
  back_to_applications: 'Zurück zu Anwendungen',
  check_guide: 'Zur Anleitung',
  settings: 'Einstellungen',
  settings_description:
    'Anwendungen werden verwendet, um Ihre Anwendungen in Logto für OIDC, Anmeldeerfahrung, Audit-Logs usw. zu identifizieren.',
  advanced_settings: 'Erweiterte Einstellungen',
  advanced_settings_description:
    'Erweiterte Einstellungen beinhalten OIDC-bezogene Begriffe. Sie können den Token-Endpunkt für weitere Informationen überprüfen.',
  application_name: 'Anwendungsname',
  application_name_placeholder: 'Meine App',
  description: 'Beschreibung',
  description_placeholder: 'Gib eine Beschreibung ein',
  authorization_endpoint: 'Autorisierungs-Endpoint',
  authorization_endpoint_tip:
    'Der Endpoint, der für die Authentifizierung und <a>Autorisierung</a> via OpenID Connect verwendet wird.',
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
  id_token_expiration: 'ID Token Ablaufzeit',
  refresh_token_expiration: 'Refresh Token Ablaufzeit',
  token_endpoint: 'Token-Endpunkt',
  user_info_endpoint: 'Benutzerinformations-Endpunkt',
  enable_admin_access: 'Admin-Zugang aktivieren',
  enable_admin_access_label:
    'Zugang zur Management API aktivieren oder deaktivieren. Wenn aktiviert, können Access Tokens verwendet werden, um die Management API im Namen der Anwendung aufzurufen.',
  delete_description:
    'Diese Aktion kann nicht rückgängig gemacht werden. Die Anwendung wird permanent gelöscht. Bitte gib den Anwendungsnamen <span>{{name}}</span> zur Bestätigung ein.',
  enter_your_application_name: 'Gib einen Anwendungsnamen ein',
  application_deleted: 'Anwendung {{name}} wurde erfolgreich gelöscht',
  redirect_uri_required: 'Gib mindestens eine Umleitungs-URI an',
};

export default application_details;
