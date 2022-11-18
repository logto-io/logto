const application_details = {
  back_to_applications: 'Zurück zu Anwendungen',
  check_guide: 'Zur Anleitung',
  settings: 'Settings', // UNTRANSLATED
  settings_description:
    'With Applications you can. Setup a mobile, web or IoT application to use Logto for Authentication. Configure the allowed Callback URLs and Secrets for your Application.', // UNTRANSLATED
  advanced_settings: 'Erweiterte Einstellungen',
  advanced_settings_description:
    'It real sent your at. Amounted all shy set why followed declared.', // UNTRANSLATED
  application_name: 'Anwendungsname',
  application_name_placeholder: 'Meine App',
  description: 'Beschreibung',
  description_placeholder: 'Gib eine Beschreibung ein',
  authorization_endpoint: 'Autorisierungs-Endpoint',
  authorization_endpoint_tip:
    'Der Endpoint, der für die Authentifizierung und Autorisierung via OpenID Connect verwendet wird.',
  application_id: 'App ID',
  application_secret: 'App Geheimnis',
  redirect_uri: 'Umleitungs-URI',
  redirect_uris: 'Umleitungs-URIs',
  redirect_uri_placeholder: 'https://deine.website.de/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'URI zu der der Benutzer nach der Anmeldung (egal ob erfolgreich oder nicht) weitergeleitet wird. See OpenID Connect AuthRequest for more info.',
  post_sign_out_redirect_uri: 'Post Sign-out Umleitungs-URI',
  post_sign_out_redirect_uris: 'Post Sign-out Umleitungs-URIs',
  post_sign_out_redirect_uri_placeholder: 'https://deine.website.de/home',
  post_sign_out_redirect_uri_tip:
    'URI zu der der Benutzer nach dem Abmelden weitergeleitet wird (optional). Hat bei einigen Anwendungstypen keine Auswirkungen.',
  cors_allowed_origins: 'CORS allowed origins',
  cors_allowed_origins_placeholder: 'https://your.website.de',
  cors_allowed_origins_tip:
    'Es sind standardmäßig alle Umleitungs-URI Origins erlaubt. Normalerweise ist dieses Feld nicht erforderlich.',
  add_another: 'Weitere hinzufügen',
  id_token_expiration: 'ID Token Ablaufzeit',
  refresh_token_expiration: 'Refresh Token Ablaufzeit',
  token_endpoint: 'Token Endpoint',
  user_info_endpoint: 'Benutzerinformations-Endpoint',
  enable_admin_access: 'Admin-Zugang aktivieren',
  enable_admin_access_label:
    'Zugang zur Management API aktivieren oder deaktivieren. Falls aktiviert, können access tokens verwendet werden, um die Management API im Namen der Anwendung aufzurufen.',
  delete_description:
    'Diese Aktion kann nicht rückgängig gemacht werden. Die Anwendung wird permanent gelöscht. Bitte gib den Anwendungsnamen <span>{{name}}</span> zur Bestätigung ein.',
  enter_your_application_name: 'Gib einen Anwendungsnamen ein',
  application_deleted: 'Anwendung {{name}} wurde erfolgreich gelöscht',
  redirect_uri_required: 'Gebe mindestens eine Umleitungs-URI an',
};

export default application_details;
