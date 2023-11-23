const enterprise_sso_details = {
  back_to_sso_connectors: 'Zurück zu Unternehmens-SSO',
  page_title: 'Unternehmens-SSO Connector-Details',
  readme_drawer_title: 'Unternehmens-SSO',
  readme_drawer_subtitle:
    'Richten Sie Unternehmens-SSO-Connectors ein, um Endbenutzern das Single Sign-On zu ermöglichen',
  tab_settings: 'Einstellungen',
  tab_connection: 'Verbindung',
  general_settings_title: 'Allgemeine Einstellungen',
  custom_branding_title: 'Benutzerdefiniertes Branding',
  custom_branding_description:
    'Passen Sie die Anzeigeinformationen des Unternehmens-IdP für die Anmelde-Schaltfläche und andere Szenarien an.',
  email_domain_field_name: 'Unternehmens-E-Mail-Domain',
  email_domain_field_description:
    'Benutzer mit dieser E-Mail-Domain können SSO zur Authentifizierung verwenden. Stellen Sie bitte sicher, dass die Domain zum Unternehmen gehört.',
  email_domain_field_placeholder: 'E-Mail-Domain',
  sync_profile_field_name: 'Profilinformationen vom Identitätsanbieter synchronisieren',
  sync_profile_option: {
    register_only: 'Nur beim ersten Anmelden synchronisieren',
    each_sign_in: 'Bei jeder Anmeldung immer synchronisieren',
  },
  connector_name_field_name: 'Connector-Name',
  connector_logo_field_name: 'Connector-Logo',
  branding_logo_context: 'Logo hochladen',
  branding_logo_error: 'Logo hochladen-Fehler: {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://deine.domain/logo.png',
  branding_dark_logo_context: 'Dunkelmodus-Logo hochladen',
  branding_dark_logo_error: 'Dunkelmodus-Logo hochladen-Fehler: {{error}}',
  branding_dark_logo_field_name: 'Logo (Dunkelmodus)',
  branding_dark_logo_field_placeholder: 'https://deine.domain/dunkelmodus-logo.png',
  check_readme: 'README überprüfen',
  enterprise_sso_deleted: 'Der Unternehmens-SSO-Connector wurde erfolgreich gelöscht',
  delete_confirm_modal_title: 'Unternehmens-SSO-Connector löschen',
  delete_confirm_modal_content:
    'Möchten Sie diesen Unternehmens-Connector wirklich löschen? Benutzer von Identitätsanbietern werden das Single Sign-On nicht nutzen können.',
  upload_idp_metadata_title: 'IdP-Metadaten hochladen',
  upload_idp_metadata_description:
    'Konfigurieren Sie die Metadaten, die vom Identitätsanbieter kopiert wurden.',
  upload_saml_idp_metadata_info_text_url:
    'Fügen Sie die Metadaten-URL vom Identitätsanbieter zum Verbinden ein.',
  upload_saml_idp_metadata_info_text_xml:
    'Fügen Sie die Metadaten vom Identitätsanbieter zum Verbinden ein.',
  upload_saml_idp_metadata_info_text_manual:
    'Füllen Sie die Metadaten vom Identitätsanbieter zum Verbinden aus.',
  upload_oidc_idp_info_text:
    'Füllen Sie die Informationen vom Identitätsanbieter zum Verbinden aus.',
  service_provider_property_title: 'Konfigurieren Sie Ihren Dienst im IdP',
  service_provider_property_description:
    'Erstellen Sie eine neue App-Integration durch {{protocol}} in Ihrem {{name}}. Fügen Sie dann die folgenden Service-Provider-Details ein, um {{protocol}} zu konfigurieren.',
  attribute_mapping_title: 'Attributzuordnung',
  attribute_mapping_description:
    'Die Benutzer-`id` und `email` werden benötigt, um das Benutzerprofil vom IdP zu synchronisieren. Geben Sie den folgenden Namen und Wert in {{name}} ein.',
  saml_preview: {
    sign_on_url: 'Anmelde-URL',
    entity_id: 'Aussteller',
    x509_certificate: 'Signaturzertifikat',
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
