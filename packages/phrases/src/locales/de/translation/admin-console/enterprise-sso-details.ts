const enterprise_sso_details = {
  back_to_sso_connectors: 'Zurück zu den Unternehmens-SSO',
  page_title: 'Details zum Unternehmens-SSO-Connector',
  readme_drawer_title: 'Unternehmens-SSO',
  readme_drawer_subtitle:
    'Richten Sie Unternehmens-SSO-Connector ein, um die SSO für Endbenutzer zu aktivieren',
  tab_experience: 'SSO-Erfahrung',
  tab_connection: 'Verbindung',
  tab_idp_initiated_auth: 'IdP-initiiertes SSO',
  general_settings_title: 'Allgemein',
  general_settings_description:
    'Konfigurieren Sie die Endbenutzererfahrung und verknüpfen Sie die Unternehmens-E-Mail-Domain für den SP-initiierten SSO-Fluss.',
  custom_branding_title: 'Anzeige',
  custom_branding_description:
    'Passen Sie den Namen und das Logo an, die im Single Sign-On-Fluss der Endbenutzer angezeigt werden. Wenn leer, werden Standardwerte verwendet.',
  email_domain_field_name: 'Unternehmens-E-Mail-Domain',
  email_domain_field_description:
    'Benutzer mit dieser E-Mail-Domain können SSO zur Authentifizierung verwenden. Bitte überprüfen Sie, ob die Domain dem Unternehmen gehört.',
  email_domain_field_placeholder: 'E-Mail-Domain',
  sync_profile_field_name: 'Profilinformationen vom Identitätsanbieter synchronisieren',
  sync_profile_option: {
    register_only: 'Nur beim ersten Anmelden synchronisieren',
    each_sign_in: 'Bei jedem Anmelden immer synchronisieren',
  },
  connector_name_field_name: 'Connector-Name',
  display_name_field_name: 'Anzeigename',
  connector_logo_field_name: 'Anzeigelogo',
  connector_logo_field_description:
    'Jedes Bild sollte kleiner als 500KB sein, nur SVG, PNG, JPG, JPEG.',
  branding_logo_context: 'Logo hochladen',
  branding_logo_error: 'Fehler beim Hochladen des Logos: {{error}}',
  branding_light_logo_context: 'Logo im hellen Modus hochladen',
  branding_light_logo_error: 'Fehler beim Hochladen des Logos im hellen Modus: {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://deine.domain/logo.png',
  branding_dark_logo_context: 'Logo im dunklen Modus hochladen',
  branding_dark_logo_error: 'Fehler beim Hochladen des Logos im dunklen Modus: {{error}}',
  branding_dark_logo_field_name: 'Logo (dunkler Modus)',
  branding_dark_logo_field_placeholder: 'https://deine.domain/dunkler-modus-logo.png',
  check_connection_guide: 'Verbindungshandbuch',
  enterprise_sso_deleted: 'Der Unternehmens-SSO-Connector wurde erfolgreich gelöscht',
  delete_confirm_modal_title: 'Unternehmens-SSO-Connector löschen',
  delete_confirm_modal_content:
    'Sind Sie sicher, dass Sie diesen Unternehmens-Connector löschen möchten? Benutzer von Identitätsanbietern werden das Single Sign-On nicht nutzen.',
  upload_idp_metadata_title_saml: 'Metadaten hochladen',
  upload_idp_metadata_description_saml:
    'Konfigurieren Sie die Metadaten, die vom Identitätsanbieter kopiert wurden.',
  upload_idp_metadata_title_oidc: 'Anmeldeinformationen hochladen',
  upload_idp_metadata_description_oidc:
    'Konfigurieren Sie die Anmeldeinformationen und OIDC-Tokeninformationen, die vom Identitätsanbieter kopiert wurden.',
  upload_idp_metadata_button_text: 'XML-Datei mit Metadaten hochladen',
  upload_signing_certificate_button_text: 'Signaturzertifikatsdatei hochladen',
  configure_domain_field_info_text:
    'Fügen Sie die E-Mail-Domain hinzu, um Unternehmensbenutzer zu ihrem Identitätsanbieter für das Single Sign-On zu führen.',
  email_domain_field_required:
    'Die E-Mail-Domain ist erforderlich, um das Unternehmens-SSO zu aktivieren.',
  upload_saml_idp_metadata_info_text_url:
    'Fügen Sie die Metadaten-URL vom Identitätsanbieter ein, um eine Verbindung herzustellen.',
  upload_saml_idp_metadata_info_text_xml:
    'Fügen Sie die Metadaten vom Identitätsanbieter ein, um eine Verbindung herzustellen.',
  upload_saml_idp_metadata_info_text_manual:
    'Füllen Sie die Metadaten vom Identitätsanbieter aus, um eine Verbindung herzustellen.',
  upload_oidc_idp_info_text:
    'Füllen Sie die Informationen vom Identitätsanbieter aus, um eine Verbindung herzustellen.',
  service_provider_property_title: 'Konfigurieren im Identitätsanbieter',
  service_provider_property_description:
    'Richten Sie eine Anwendungsintegration mit {{protocol}} in Ihrem Identitätsanbieter ein. Geben Sie die von Logto bereitgestellten Details ein.',
  attribute_mapping_title: 'Attributzuordnungen',
  attribute_mapping_description:
    'Synchronisieren Sie Benutzerprofile vom Identitätsanbieter, indem Sie die Benutzerattributzumordnung entweder auf der Seite des Identitätsanbieters oder von Logto konfigurieren.',
  saml_preview: {
    sign_on_url: 'Anmeldungs-URL',
    entity_id: 'Aussteller',
    x509_certificate: 'Signaturzertifikat',
    certificate_content: 'Läuft ab {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'Autorisierungs-Endpunkt',
    token_endpoint: 'Token-Endpunkt',
    userinfo_endpoint: 'Benutzerinformations-Endpunkt',
    jwks_uri: 'JSON Web Key Set-Endpunkt',
    issuer: 'Aussteller',
  },
  idp_initiated_auth_config: {
    card_title: 'IdP-initiiertes SSO',
    card_description:
      'Benutzer starten normalerweise den Authentifizierungsprozess von deiner App aus mit dem SP-initiierten SSO-Fluss. Diese Funktion NICHT aktivieren, es sei denn, es ist absolut notwendig.',
    enable_idp_initiated_sso: 'IdP-initiiertes SSO aktivieren',
    enable_idp_initiated_sso_description:
      'Erlaube Unternehmensbenutzern, den Authentifizierungsprozess direkt vom Portal des Identitätsanbieters aus zu starten. Bitte verstehe die potenziellen Sicherheitsrisiken, bevor du diese Funktion aktivierst.',
    default_application: 'Standardanwendung',
    default_application_tooltip:
      'Zielanwendung, zu der der Benutzer nach der Authentifizierung weitergeleitet wird.',
    empty_applications_error:
      'Keine Anwendungen gefunden. Bitte füge eine in der <a>Anwendungen</a> Sektion hinzu.',
    empty_applications_placeholder: 'Keine Anwendungen',
    authentication_type: 'Authentifizierungstyp',
    auto_authentication_disabled_title: 'Umleitung zum Client für SP-initiiertes SSO',
    auto_authentication_disabled_description:
      'Empfohlen. Leite Benutzer zur Client-seitigen Anwendung weiter, um eine sichere SP-initiierte OIDC-Authentifizierung zu starten. Dadurch werden CSRF-Angriffe verhindert.',
    auto_authentication_enabled_title: 'Direkt anmelden mit IdP-initiiertem SSO',
    auto_authentication_enabled_description:
      'Nach erfolgreicher Anmeldung werden Benutzer zur angegebenen Redirect-URI mit dem Autorisierungscode weitergeleitet (Ohne Status- und PKCE-Validierung).',
    auto_authentication_disabled_app: 'Für traditionelle Webanwendung, Single-Page-App (SPA)',
    auto_authentication_enabled_app: 'Für traditionelle Webanwendung',
    idp_initiated_auth_callback_uri: 'Client Callback-URI',
    idp_initiated_auth_callback_uri_tooltip:
      'Die Client Callback-URI zum Initiieren eines SP-initiierten SSO-Authentifizierungsflusses. Eine ssoConnectorId wird der URI als Abfrageparameter hinzugefügt. (z.B., https://deine.domain/sso/callback?connectorId={{ssoConnectorId}})',
    redirect_uri: 'Post-Login Redirect-URI',
    redirect_uri_tooltip:
      'Die Redirect-URI, um Benutzer nach erfolgreichem Anmelden weiterzuleiten. Logto wird diese URI als die OIDC-Redirect-URI in der Autorisierungsanforderung verwenden. Verwende eine dedizierte URI für den IdP-initiierten SSO-Authentifizierungsfluss für bessere Sicherheit.',
    empty_redirect_uris_error:
      'Keine Redirect-URI wurde für die Anwendung registriert. Bitte füge zuerst eine hinzu.',
    redirect_uri_placeholder: 'Wähle eine Post-Login Redirect-URI',
    auth_params: 'Zusätzliche Authentifizierungsparameter',
    auth_params_tooltip:
      'Zusätzliche Parameter, die in der Autorisierungsanforderung übergeben werden sollen. Standardmäßig werden nur (openid profile) Scopes angefordert, du kannst hier zusätzliche Scopes oder einen exklusiven State-Wert angeben. (z.B., { "scope": "organizations email", "state": "secret_state" }).',
  },
  trust_unverified_email: 'Unverifizierte E-Mail vertrauen',
  trust_unverified_email_label:
    'Vertraue immer den unverifizierten E-Mail-Adressen, die vom Identitätsanbieter zurückgegeben werden',
  trust_unverified_email_tip:
    'Der Entra ID (OIDC) Connector gibt den `email_verified` Anspruch nicht zurück, was bedeutet, dass E-Mail-Adressen von Azure nicht garantiert überprüft werden. Standardmäßig synchronisiert Logto keine unverifizierten E-Mail-Adressen mit dem Benutzerprofil. Aktiviere diese Option nur, wenn du allen E-Mail-Adressen aus dem Entra ID Verzeichnis vertraust.',
  offline_access: {
    label: 'Zugriffstoken aktualisieren',
    description:
      'Aktiviere Google-„Offline“-Zugriff, um einen Aktualisierungs-Token anzufordern, damit deine App das Zugriffstoken ohne erneute Benutzerautorisierung aktualisieren kann.',
  },
};

export default Object.freeze(enterprise_sso_details);
