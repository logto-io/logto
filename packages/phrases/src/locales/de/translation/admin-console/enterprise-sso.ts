const enterprise_sso = {
  page_title: 'Unternehmens-SSO',
  title: 'Unternehmens-SSO',
  subtitle:
    'Verbinden Sie den Unternehmensidentitätsanbieter und aktivieren Sie das SP-gesteuerte Single Sign-On.',
  create: 'Unternehmensconnector hinzufügen',
  col_connector_name: 'Connector-Name',
  col_type: 'Typ',
  col_email_domain: 'E-Mail-Domain',
  placeholder_title: 'Unternehmensconnector',
  placeholder_description:
    'Logto hat viele eingebaute Unternehmensidentitätsanbieter bereitgestellt, Sie können auch Ihren eigenen mit den SAML- und OIDC-Protokollen erstellen.',
  create_modal: {
    title: 'Unternehmensconnector hinzufügen',
    text_divider: 'Oder Sie können Ihren Connector mit einem Standardprotokoll anpassen.',
    connector_name_field_title: 'Connector-Name',
    connector_name_field_placeholder: 'Z.B., \\{Firmenname\\} - \\{Identitätsanbietername\\}',
    create_button_text: 'Connector erstellen',
  },
  guide: {
    subtitle: 'Ein schrittweiser Leitfaden zur Verbindung des Unternehmensidentitätsanbieters.',
    finish_button_text: 'Continue',
  },
  basic_info: {
    title: 'Konfigurieren Sie Ihren Dienst im IdP',
    description:
      'Erstellen Sie eine neue Anwendungsintegration per SAML 2.0 in Ihrem {{name}}-Identitätsanbieter. Fügen Sie dann den folgenden Wert hinzu.',
    saml: {
      acs_url_field_name: 'Zieldienst-URL für Assertionsverbrauch (Antwort-URL)',
      audience_uri_field_name: 'Ziel-URI (SP Entity ID)',
    },
    oidc: {
      redirect_uri_field_name: 'Weiterleitungs-URI (Callback-URL)',
    },
  },
  attribute_mapping: {
    title: 'Attributzuordnungen',
    description:
      '`id` und `email` sind erforderlich, um das Benutzerprofil vom IdP zu synchronisieren. Geben Sie den folgenden Claim-Namen und Wert in Ihrem IdP ein.',
    col_sp_claims: 'Wert des Dienstanbieters (Logto)',
    col_idp_claims: 'Claim-Name des Identitätsanbieters',
    idp_claim_tooltip: 'Der Claim-Name des Identitätsanbieters',
  },
  metadata: {
    title: 'Konfigurieren Sie die IdP-Metadaten',
    description: 'Konfigurieren Sie die Metadaten aus dem Identitätsanbieter',
    dropdown_trigger_text: 'Verwenden Sie eine andere Konfigurationsmethode',
    dropdown_title: 'Wählen Sie Ihre Konfigurationsmethode aus',
    metadata_format_url: 'Geben Sie die Metadaten-URL ein',
    metadata_format_xml: 'Laden Sie die Metadaten-XML-Datei hoch',
    metadata_format_manual: 'Geben Sie die Metadaten manuell ein',
    saml: {
      metadata_url_field_name: 'Metadaten-URL',
      metadata_url_description:
        'Daten dynamisch von der Metadaten-URL abrufen und das Zertifikat auf dem neuesten Stand halten.',
      metadata_xml_field_name: 'IdP-Metadaten-XML-Datei',
      metadata_xml_uploader_text: 'Laden Sie die Metadaten-XML-Datei hoch',
      sign_in_endpoint_field_name: 'Anmeldungs-URL',
      idp_entity_id_field_name: 'IdP-Entitäts-ID (Issuer)',
      certificate_field_name: 'Signierungszertifikat',
      certificate_placeholder: 'Kopieren und fügen Sie das x509-Zertifikat ein',
      certificate_required: 'Das Signierungszertifikat ist erforderlich.',
    },
    oidc: {
      client_id_field_name: 'Client-ID',
      client_secret_field_name: 'Client-Geheimnis',
      issuer_field_name: 'Herausgeber',
      scope_field_name: 'Umfang',
    },
  },
};

export default Object.freeze(enterprise_sso);
