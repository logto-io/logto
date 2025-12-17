const application_details = {
  page_title: 'Anwendungsdaten',
  back_to_applications: 'Zurück zu Anwendungen',
  check_guide: 'Zur Anleitung',
  settings: 'Einstellungen',
  settings_description:
    'Eine Anwendung ist eine registrierte Software oder ein Dienst, der auf Benutzerinformationen zugreifen oder im Namen eines Nutzers agieren kann. Anwendungen helfen Logto dabei, zu erkennen, wer was anfordert, und kümmern sich um Anmeldung und Berechtigungen. Füllen Sie die erforderlichen Felder für die Authentifizierung aus.',
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
  machine_logs: 'Maschinenprotokolle',
  application_name: 'Anwendungsname',
  application_name_placeholder: 'Meine App',
  description: 'Beschreibung',
  description_placeholder: 'Gib eine Beschreibung ein',
  config_endpoint: 'OpenID Provider Konfigurations-Endpunkt',
  issuer_endpoint: 'Issuer-Endpunkt',
  jwks_uri: 'JWKS-URI',
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
  application_secret_other: 'App-Geheimnisse',
  redirect_uri: 'Umleitungs-URI',
  redirect_uris: 'Umleitungs-URIs',
  redirect_uri_placeholder: 'https://deine.website.de/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'URI, zu dem der Benutzer nach der Anmeldung (egal ob erfolgreich oder nicht) weitergeleitet wird. Siehe OpenID Connect <a>AuthRequest</a> für weitere Informationen.',
  mixed_redirect_uri_warning:
    'Dein Anwendungstyp ist nicht mit mindestens einer der Umleitungs-URIs kompatibel. Es folgt nicht den bewährten Methoden und wir empfehlen dringend, die Umleitungs-URIs konsistent zu halten.',
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
  rotate_refresh_token_label_for_public_clients:
    'Wenn aktiviert, wird Logto für jede Tokenanfrage ein neues Auffrischungstoken ausstellen. <a>Erfahren Sie mehr</a>',
  backchannel_logout: 'Backchannel-Logout',
  backchannel_logout_description:
    'Konfigurieren Sie den OpenID Connect-Backchannel-Logout-Endpunkt und ob eine Sitzung für diese Anwendung erforderlich ist.',
  backchannel_logout_uri: 'Backchannel-Logout-URI',
  backchannel_logout_uri_session_required: 'Ist eine Sitzung erforderlich?',
  backchannel_logout_uri_session_required_description:
    'Wenn aktiviert, erfordert der RP, dass ein `sid`- (Sitzungs-ID) Anspruch im Logout-Token enthalten ist, um die RP-Sitzung mit dem OP zu identifizieren, wenn die `backchannel_logout_uri` verwendet wird.',
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
  third_party_settings_description:
    'Integrieren Sie Drittanwendungen mit Logto als Ihren Identity Provider (IdP) unter Verwendung von OIDC / OAuth 2.0, mit einem Einwilligungsbildschirm für die Benutzerautorisierung.',
  session_duration: 'Sitzungsdauer (Tage)',
  try_it: 'Probieren Sie es aus',
  no_organization_placeholder: 'Keine Organisation gefunden. <a>Zu den Organisationen</a>',
  field_custom_data: 'Benutzerdefinierte Daten',
  field_custom_data_tip:
    'Zusätzliche benutzerdefinierte Anwendungsinformationen, die nicht in den vordefinierten Anwendungseigenschaften aufgeführt sind, wie z. B. geschäftsspezifische Einstellungen und Konfigurationen.',
  custom_data_invalid: 'Benutzerdefinierte Daten müssen ein gültiges JSON-Objekt sein',
  branding: {
    name: 'Branding',
    description:
      'Passen Sie den Anzeigenamen und das Logo Ihrer Anwendung auf dem Einwilligungsbildschirm an.',
    description_third_party:
      'Passen Sie den Anzeigenamen und das Logo Ihrer Anwendung auf dem Einwilligungsbildschirm an.',
    app_logo: 'App-Logo',
    app_level_sie: 'Anmeldeerfahrung auf App-Ebene',
    app_level_sie_switch:
      'Aktivieren Sie die Anmeldeerfahrung auf App-Ebene und richten Sie app-spezifisches Branding ein. Wenn deaktiviert, wird die Omni-Anmeldeerfahrung verwendet.',
    more_info: 'Mehr Infos',
    more_info_description:
      'Bieten Sie den Benutzern auf dem Einwilligungsbildschirm weitere Informationen über Ihre Anwendung.',
    display_name: 'Anzeigenamen',
    application_logo: 'Anwendungslogo',
    application_logo_dark: 'Anwendungslogo (dunkel)',
    brand_color: 'Markenfarbe',
    brand_color_dark: 'Markenfarbe (dunkel)',
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
    field_description: 'Erscheint auf dem Einwilligungsbildschirm',
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
    oidc_title: 'OIDC',
    oidc_description:
      'Kern-OIDC-Berechtigungen werden automatisch für Ihre App konfiguriert. Diese Scopes sind für die Authentifizierung erforderlich und werden nicht auf dem Einwilligungsbildschirm angezeigt.',
    default_oidc_permissions: 'Standard-OIDC-Berechtigungen',
    permission_column: 'Berechtigung',
    guide_column: 'Anleitung',
    openid_permission: 'openid',
    openid_permission_guide:
      "Optional für den Zugriff auf OAuth-Ressourcen.\nErforderlich für die OIDC-Authentifizierung. Gewährt Zugriff auf ein ID-Token und ermöglicht den Zugriff auf den 'userinfo_endpoint'.",
    offline_access_permission: 'offline_access',
    offline_access_permission_guide:
      'Optional. Ruft Refresh-Tokens für langfristigen Zugriff oder Hintergrundaufgaben ab.',
  },
  roles: {
    assign_button: 'Rollen von Maschine zu Maschine zuweisen',
    delete_description:
      'Diese Aktion entfernt diese Rolle von dieser Maschinen-zu-Maschinen-App. Die Rolle existiert zwar weiterhin, ist jedoch nicht mehr mit dieser Maschinen-zu-Maschinen-App verknüpft.',
    deleted: '{{name}} wurde erfolgreich von diesem Benutzer entfernt.',
    assign_title: 'Rollen an {{name}} zuweisen',
    assign_subtitle:
      'Machine-to-Machine-Apps müssen Rollen vom Typ Machine-to-Machine haben, um auf verwandte API-Ressourcen zuzugreifen.',
    assign_role_field: 'Rollen von Maschine zu Maschine zuweisen',
    role_search_placeholder: 'Nach Rollennamen suchen',
    added_text: '{{value, number}} hinzugefügt',
    assigned_app_count: '{{value, number}} Anwendungen',
    confirm_assign: 'Rollen von Maschine zu Maschine zuweisen',
    role_assigned: 'Rolle(n) erfolgreich zugewiesen',
    search: 'Nach Rollennamen, Beschreibung oder ID suchen',
    empty: 'Keine Rollen verfügbar',
  },
  secrets: {
    value: 'Wert',
    empty: 'Die Anwendung hat keine Geheimnisse.',
    created_at: 'Erstellt am',
    expires_at: 'Läuft ab am',
    never: 'Niemals',
    create_new_secret: 'Neues Geheimnis erstellen',
    delete_confirmation:
      'Diese Aktion kann nicht rückgängig gemacht werden. Sind Sie sicher, dass Sie dieses Geheimnis löschen möchten?',
    deleted: 'Das Geheimnis wurde erfolgreich gelöscht.',
    activated: 'Das Geheimnis wurde erfolgreich aktiviert.',
    deactivated: 'Das Geheimnis wurde erfolgreich deaktiviert.',
    legacy_secret: 'Altes Geheimnis',
    expired: 'Abgelaufen',
    expired_tooltip: 'Dieses Geheimnis lief am {{date}} ab.',
    create_modal: {
      title: 'Anwendungsgeheimnis erstellen',
      expiration: 'Ablauf',
      expiration_description: 'Das Geheimnis läuft am {{date}} ab.',
      expiration_description_never:
        'Das Geheimnis läuft niemals ab. Wir empfehlen, ein Ablaufdatum festzulegen, um die Sicherheit zu verbessern.',
      days: '{{count}} Tag',
      days_other: '{{count}} Tage',
      years: '{{count}} Jahr',
      years_other: '{{count}} Jahre',
      created: 'Das Geheimnis {{name}} wurde erfolgreich erstellt.',
    },
    edit_modal: {
      title: 'Anwendungsgeheimnis bearbeiten',
      edited: 'Das Geheimnis {{name}} wurde erfolgreich bearbeitet.',
    },
  },
  saml_idp_config: {
    title: 'SAML IdP-Metadaten',
    description:
      'Verwenden Sie die folgenden Metadaten und das Zertifikat, um den SAML IdP in Ihrer Anwendung zu konfigurieren.',
    metadata_url_label: 'IdP Metadaten-URL',
    single_sign_on_service_url_label: 'Single Sign-On Dienst-URL',
    idp_entity_id_label: 'IdP Entitäts-ID',
  },
  saml_idp_certificates: {
    title: 'SAML Signaturzertifikat',
    expires_at: 'Läuft ab am',
    finger_print: 'Fingerabdruck',
    status: 'Status',
    active: 'Aktiv',
    inactive: 'Inaktiv',
  },
  saml_idp_name_id_format: {
    title: 'Name-ID-Format',
    description: 'Wählen Sie das Name-ID-Format des SAML IdP.',
    persistent: 'Persistent',
    persistent_description: 'Verwende Logto-Benutzer-ID als Name ID',
    transient: 'Transient',
    transient_description: 'Verwende einmalige Benutzer-ID als Name ID',
    unspecified: 'Nicht spezifiziert',
    unspecified_description: 'Verwende Logto-Benutzer-ID als Name ID',
    email_address: 'E-Mail-Adresse',
    email_address_description: 'Verwende E-Mail-Adresse als Name ID',
  },
  saml_encryption_config: {
    encrypt_assertion: 'Verschlüssele SAML-Aussage',
    encrypt_assertion_description:
      'Durch Aktivieren dieser Option wird die SAML-Aussage verschlüsselt.',
    encrypt_then_sign: 'Verschlüsseln, dann signieren',
    encrypt_then_sign_description:
      'Durch Aktivieren dieser Option wird die SAML-Aussage verschlüsselt und dann signiert; andernfalls wird die SAML-Aussage signiert und dann verschlüsselt.',
    certificate: 'Zertifikat',
    certificate_tooltip:
      'Kopieren und fügen Sie das x509-Zertifikat ein, das Sie von Ihrem Dienstanbieter erhalten, um die SAML-Aussage zu verschlüsseln.',
    certificate_placeholder:
      '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...\n-----END CERTIFICATE-----\n',
    certificate_missing_error: 'Zertifikat ist erforderlich.',
    certificate_invalid_format_error:
      'Ungültiges Zertifikatsformat entdeckt. Bitte überprüfen Sie das Format des Zertifikats und versuchen Sie es erneut.',
  },
  saml_app_attribute_mapping: {
    name: 'Attributzuordnungen',
    title: 'Basis-Attributzuordnungen',
    description:
      'Fügen Sie Attributzuordnungen hinzu, um Benutzerprofile von Logto zu Ihrer Anwendung zu synchronisieren.',
    col_logto_claims: 'Wert von Logto',
    col_sp_claims: 'Wertname Ihrer Anwendung',
    add_button: 'Weitere hinzufügen',
  },
};

export default Object.freeze(application_details);
