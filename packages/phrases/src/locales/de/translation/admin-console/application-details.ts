const application_details = {
  page_title: 'Anwendungsdaten',
  back_to_applications: 'Zurück zu Anwendungen',
  check_guide: 'Zur Anleitung',
  settings: 'Einstellungen',
  settings_description:
    'Eine "Anwendung" ist eine registrierte Software oder Dienst, die auf Benutzerinformationen zugreifen oder im Namen eines Benutzers agieren kann. Anwendungen helfen dabei, zu erkennen, wer von Logto was verlangt, und behandeln die Anmeldung und Berechtigung. Fülle die erforderlichen Felder für die Authentifizierung aus.',
  integration: 'Integration',
  integration_description:
    'Implementieren Sie sichere Worker von Logto, die von Cloudflares Edge-Netzwerk betrieben werden, für eine erstklassige Leistung und weltweite 0ms-Cold-Starts.',
  service_configuration: 'Dienstkonfiguration',
  service_configuration_description:
    'Führen Sie die erforderlichen Konfigurationen in Ihrem Dienst durch.',
  session: 'Sitzung',
  endpoints_and_credentials: 'Endpunkte & Anmeldeinformationen',
  endpoints_and_credentials_description:
    'Verwenden Sie die folgenden Endpunkte und Anmeldeinformationen, um die OIDC-Verbindung in Ihrer Anwendung einzurichten.',
  refresh_token_settings: 'Auffrischungstoken',
  refresh_token_settings_description:
    'Verwalten Sie die Auffrischungstoken-Regeln für diese Anwendung.',
  application_roles: 'Rollen',
  machine_logs: 'Maschinenprotokolle',
  application_name: 'Anwendungsname',
  application_name_placeholder: 'Meine App',
  description: 'Beschreibung',
  description_placeholder: 'Gib eine Beschreibung ein',
  config_endpoint: 'OpenID Provider Konfigurations-Endpunkt',
  authorization_endpoint: 'Autorisierungs-Endpoint',
  authorization_endpoint_tip:
    'Der Endpunkt, der für die Authentifizierung und <a>Authorisierung</a> über OpenID Connect verwendet wird.',
  show_endpoint_details: 'Endpunktdetails anzeigen',
  hide_endpoint_details: 'Endpunktdetails ausblenden',
  logto_endpoint: 'Logto-Endpunkt',
  application_id: 'App-ID',
  application_id_tip:
    'Die eindeutige Anwendungs-ID, die normalerweise von Logto generiert wird. Steht auch für "<a>client_id</a>" in OpenID Connect.',
  application_secret: 'App-Geheimnis',
  redirect_uri: 'Umleitungs-URI',
  redirect_uris: 'Umleitungs-URIs',
  redirect_uri_placeholder: 'https://deine.website.de/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'URI, zu dem der Benutzer nach der Anmeldung (egal ob erfolgreich oder nicht) weitergeleitet wird. Siehe OpenID Connect <a>AuthRequest</a> für weitere Informationen.',
  post_sign_out_redirect_uri: 'Umleitungs-URI nach Abmeldung',
  post_sign_out_redirect_uris: 'Umleitungs-URIs nach Abmeldung',
  post_sign_out_redirect_uri_placeholder: 'https://deine.website.de/home',
  post_sign_out_redirect_uri_tip:
    'URI, zu dem der Benutzer nach dem Abmelden weitergeleitet wird (optional). Hat bei einigen Anwendungstypen keine Auswirkungen.',
  cors_allowed_origins: 'CORS-erlaubte Ursprünge',
  cors_allowed_origins_placeholder: 'https://deine.website.de',
  cors_allowed_origins_tip:
    'Standardmäßig sind alle Ursprünge für Umleitungs-URIs zugelassen. In der Regel ist dieses Feld nicht erforderlich. Siehe die <a>MDN-Dokumentation</a> für detaillierte Informationen.',
  token_endpoint: 'Token-Endpunkt',
  user_info_endpoint: 'Benutzerinformations-Endpunkt',
  enable_admin_access: 'Admin-Zugriff aktivieren',
  enable_admin_access_label:
    'Aktivieren oder deaktivieren Sie den Zugriff auf die Management-API. Bei Aktivierung können Zugriffstoken verwendet werden, um die Management-API im Namen der Anwendung aufzurufen.',
  always_issue_refresh_token: 'Immer das Auffrischungstoken ausgeben',
  always_issue_refresh_token_label:
    'Durch Aktivierung dieser Konfiguration kann Logto immer Auffrischungstoken ausgeben, unabhängig davon, ob "prompt=consent" in der Authentifizierungsanforderung angegeben ist. Diese Praxis wird jedoch nur empfohlen, wenn es notwendig ist, da sie nicht mit OpenID Connect kompatibel ist und möglicherweise Probleme verursachen kann.',
  refresh_token_ttl: 'Ablaufzeit des Auffrischungstokens in Tagen',
  refresh_token_ttl_tip:
    'Die Zeitdauer, für die ein Auffrischungstoken verwendet werden kann, um neue Zugriffstoken anzufordern, bevor es abläuft und ungültig wird. Tokenanfragen verlängern die Ablaufzeit des Auffrischungstokens auf diesen Wert.',
  rotate_refresh_token: 'Auffrischungstoken drehen',
  rotate_refresh_token_label:
    'Wenn diese Option aktiviert ist, wird Logto ein neues Auffrischungstoken für Tokenanfragen ausgeben, wenn 70% der ursprünglichen Zeit bis zum Ablauf (TTL) verstrichen sind oder bestimmte Bedingungen erfüllt sind. <a>Erfahren Sie mehr</a>',
  delete_description:
    'Diese Aktion ist nicht umkehrbar. Die Anwendung wird dauerhaft gelöscht. Bitte geben Sie den Anwendungsnamen <span>{{name}}</span> zur Bestätigung ein.',
  enter_your_application_name: 'Geben Sie einen Anwendungsnamen ein',
  application_deleted: 'Anwendung {{name}} wurde erfolgreich gelöscht',
  redirect_uri_required: 'Geben Sie mindestens eine Umleitungs-URI an',
  app_domain_description_1:
    'Nutzen Sie Ihre Domain mit {{domain}} von Logto, die dauerhaft gültig ist.',
  app_domain_description_2:
    'Nutzen Sie Ihre Domain <domain>{{domain}}</domain> die dauerhaft gültig ist.',
  custom_rules: 'Benutzerdefinierte Authentifizierungsregeln',
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  custom_rules_description:
    'Legen Sie Regeln mit regulären Ausdrücken für authentifizierungsbedürftige Routen fest. Standardmäßig: Vollständiger Schutz der Website, wenn nichts angegeben ist.',
  authentication_routes: 'Authentifizierungsrouten',
  custom_rules_tip:
    "Hier sind zwei Szenarien:<ol><li>Um nur die Routen '/admin' und '/privacy' mit Authentifizierung zu schützen: ^/(admin|privacy)/.*</li><li>Um JPG-Bilder von der Authentifizierung auszuschließen: ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    'Leiten Sie Ihren Authentifizierungsbutton mit den angegebenen Routen weiter. Hinweis: Diese Routen sind unersetzbar.',
  protect_origin_server: 'Schützen Sie Ihren Herkunftsserver',
  protect_origin_server_description:
    'Stellen Sie sicher, dass Ihr Herkunftsserver vor direktem Zugriff geschützt ist. Beachten Sie die Anleitung für weitere <a>detaillierte Anweisungen</a>.',
  session_duration: 'Sitzungsdauer (Tage)',
  try_it: 'Probieren Sie es aus',
  branding: {
    name: 'Branding',
    description:
      'Passen Sie den Anzeigenamen und das Logo Ihrer Anwendung auf dem Einwilligungsbildschirm an.',
    more_info: 'Mehr Infos',
    more_info_description:
      'Bieten Sie den Benutzern auf dem Einwilligungsbildschirm weitere Informationen über Ihre Anwendung.',
    display_name: 'Anzeigenamen',
    display_logo: 'Logo anzeigen',
    display_logo_dark: 'Logo anzeigen (dunkel)',
    terms_of_use_url: 'URL der Anwendungsbedingungen',
    privacy_policy_url: 'URL der Anwendungsdatenschutzbestimmungen',
  },
  permissions: {
    name: 'Berechtigungen',
    description:
      'Wählen Sie die Berechtigungen aus, die die Drittanbieteranwendung für die Benutzerautorisierung zum Zugriff auf bestimmte Datentypen benötigt.',
    user_permissions: 'Persönliche Benutzerdaten',
    organization_permissions: 'Zugriff auf Organisation',
    table_name: 'Berechtigungen erteilen',
    field_name: 'Berechtigung',
    field_description: 'Ersccheint auf dem Einwilligungsbildschirm',
    delete_text: 'Berechtigung entfernen',
    permission_delete_confirm:
      'Diese Aktion hebt die der Drittanbieter-App erteilten Berechtigungen auf, was sie daran hindert, Benutzerberechtigung für bestimmte Datentypen anzufragen. Sind Sie sicher, dass Sie fortfahren möchten?',
    permissions_assignment_description:
      'Wählen Sie die Berechtigungen aus, die die Drittanbieteranwendung für die Benutzerautorisierung zum Zugriff auf bestimmte Datentypen benötigt.',
    user_profile: 'Benutzerdaten',
    api_permissions: 'API-Berechtigungen',
    organization: 'Organisationsberechtigungen',
    user_permissions_assignment_form_title:
      'Fügen Sie die Berechtigungen für das Benutzerprofil hinzu',
    organization_permissions_assignment_form_title:
      'Fügen Sie die Organisationsberechtigungen hinzu',
    api_resource_permissions_assignment_form_title:
      'Fügen Sie die Berechtigungen für die API-Ressource hinzu',
    user_data_permission_description_tips:
      'Sie können die Beschreibung der Berechtigungen für personenbezogene Benutzerdaten über "Anmeldeerfahrung > Inhalt > Sprache verwalten" ändern.',
    permission_description_tips:
      'Wenn Logto als Identitätsanbieter (IdP) für die Authentifizierung in Drittanbieter-Apps verwendet wird und Benutzer um Autorisierung gebeten werden, erscheint diese Beschreibung auf dem Einwilligungsbildschirm.',
    user_title: 'Benutzer',
    user_description:
      'Wählen Sie die Berechtigungen aus, die von der Drittanbieter-App für den Zugriff auf bestimmte Benutzerdaten angefordert werden.',
    grant_user_level_permissions: 'Berechtigungen für Benutzerdaten erteilen',
    organization_title: 'Organisation',
    organization_description:
      'Wählen Sie die Berechtigungen aus, die von der Drittanbieter-App für den Zugriff auf bestimmte Organisationsdaten angefordert werden.',
    grant_organization_level_permissions: 'Berechtigungen für Organisationdaten erteilen',
  },
  roles: {
    name_column: 'Rolle',
    description_column: 'Beschreibung',
    assign_button: 'Rollen zuweisen',
    delete_description:
      'Diese Aktion entfernt diese Rolle von dieser Maschinen-zu-Maschinen-App. Die Rolle existiert zwar weiterhin, ist jedoch nicht mehr mit dieser Maschinen-zu-Maschinen-App verknüpft.',
    deleted: '{{name}} wurde erfolgreich von diesem Benutzer entfernt.',
    assign_title: 'Rollen an {{name}} zuweisen',
    assign_subtitle: '{{name}} mit einer oder mehreren Rollen autorisieren',
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
