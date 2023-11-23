const enterprise_sso = {
  page_title: 'Enterprise SSO',
  title: 'Enterprise SSO',
  subtitle:
    'Verbinden Sie den Unternehmensidentitätsanbieter und aktivieren Sie das SP-gesteuerte Single Sign-On.',
  create: 'Unternehmensconnector hinzufügen',
  col_connector_name: 'Connector-Name',
  col_type: 'Typ',
  col_email_domain: 'E-Mail-Domain',
  col_status: 'Status',
  col_status_in_use: 'In Verwendung',
  col_status_invalid: 'Ungültig',
  placeholder_title: 'Unternehmensconnector',
  placeholder_description:
    'Logto hat viele integrierte Unternehmensidentitätsanbieter zur Verbindung bereitgestellt. Gleichzeitig können Sie Ihren eigenen Anbieter mit Standardprotokollen erstellen.',
  create_modal: {
    title: 'Unternehmensconnector hinzufügen',
    text_divider: 'Oder Sie können Ihren Connector mit einem Standardprotokoll anpassen.',
    connector_name_field_title: 'Connector-Name',
    connector_name_field_placeholder: 'Name für den Unternehmensidentitätsanbieter',
    create_button_text: 'Connector erstellen',
  },
  guide: {
    subtitle: 'Ein schrittweiser Leitfaden zur Verbindung des Unternehmens-Identitätsanbieters.',
    finish_button_text: 'Weiter',
  },
  basic_info: {
    title: 'Konfigurieren Sie Ihren Service im IdP',
    description:
      'Erstellen Sie eine neue Anwendungsintegration nach SAML 2.0 in Ihrem {{name}}-Identitätsanbieter. Fügen Sie dann den folgenden Wert ein.',
    saml: {
      acs_url_field_name: 'Zielservice-URL (Antwort-URL)',
      audience_uri_field_name: 'Ziel-URI (SP-Entity-ID)',
    },
    oidc: {
      redirect_uri_field_name: 'Weiterleitungs-URL (Callback-URL)',
    },
  },
  attribute_mapping: {
    title: 'Attributzuordnungen',
    description:
      '`id` und `email` sind erforderlich, um das Benutzerprofil aus dem IdP zu synchronisieren. Geben Sie den folgenden Claim-Namen und -Wert in Ihrem IdP ein.',
    col_sp_claims: 'Claim-Name von Logto',
    col_idp_claims: 'Claim-Name des Identitätsanbieters',
    idp_claim_tooltip: 'Der Claim-Name des Identitätsanbieters',
  },
  metadata: {
    title: 'Konfigurieren der IdP-Metadaten',
    description: 'Konfigurieren Sie die Metadaten des Identitätsanbieters',
    dropdown_trigger_text: 'Verwenden Sie eine andere Konfigurationsmethode',
    dropdown_title: 'Wählen Sie Ihre Konfigurationsmethode aus',
    metadata_format_url: 'Geben Sie die Metadaten-URL ein',
    metadata_format_xml: 'Laden Sie die Metadaten-XML-Datei hoch',
    metadata_format_manual: 'Geben Sie die Metadatendetails manuell ein',
    saml: {
      metadata_url_field_name: 'Metadaten-URL',
      metadata_url_description:
        'Daten dynamisch von der Metadaten-URL abrufen und das Zertifikat aktuell halten.',
      metadata_xml_field_name: 'Metadaten-XML-Datei',
      metadata_xml_uploader_text: 'Laden Sie die Metadaten-XML-Datei hoch',
      sign_in_endpoint_field_name: 'Anmeldungs-URL',
      idp_entity_id_field_name: 'IdP-Entitäts-ID (Issuer)',
      certificate_field_name: 'Signaturzertifikat',
      certificate_placeholder: 'Kopieren und fügen Sie das x509-Zertifikat ein',
    },
    oidc: {
      client_id_field_name: 'Client-ID',
      client_secret_field_name: 'Client-Geheimnis',
      issuer_field_name: 'Aussteller',
      scope_field_name: 'Umfang',
    },
  },
};

export default Object.freeze(enterprise_sso);
