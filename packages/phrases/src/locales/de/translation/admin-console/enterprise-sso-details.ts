const enterprise_sso_details = {
  back_to_sso_connectors: 'Zurück zu den Unternehmens-SSO',
  page_title: 'Details zum Unternehmens-SSO-Connector',
  readme_drawer_title: 'Unternehmens-SSO',
  readme_drawer_subtitle:
    'Richten Sie Unternehmens-SSO-Connector ein, um die SSO für Endbenutzer zu aktivieren',
  tab_experience: 'SSO-Erfahrung',
  tab_connection: 'Verbindung',
  general_settings_title: 'Allgemein',
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
};

export default Object.freeze(enterprise_sso_details);
