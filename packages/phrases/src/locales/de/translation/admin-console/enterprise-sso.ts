const enterprise_sso = {
  page_title: 'Unternehmens-SSO',
  title: 'Unternehmens-SSO',
  subtitle: 'Verbinden Sie den Unternehmensidentitätsanbieter und aktivieren Sie Single Sign-On.',
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
    finish_button_text: 'Fortfahren',
  },
  basic_info: {
    title: 'Konfigurieren Sie Ihren Dienst im IdP',
    description:
      'Erstellen Sie eine neue Anwendungsintegration per SAML 2.0 in Ihrem {{name}}-Identitätsanbieter. Fügen Sie dann den folgenden Wert hinzu.',
    saml: {
      acs_url_field_name: 'Zieldienst-URL für Assertionsverbrauch (Antwort-URL)',
      audience_uri_field_name: 'Empfänger-URI (SP-Entitäts-ID)',
      entity_id_field_name: 'Dienstanbieter (SP) Entitäts-ID',
      entity_id_field_tooltip:
        'Die SP-Entitäts-ID kann in jedem Zeichenfolgenformat vorliegen, typischerweise wird ein URI- oder URL-Format als Bezeichner verwendet, aber dies ist nicht zwingend erforderlich.',
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: 'Weiterleitungs-URI (Callback-URL)',
      redirect_uri_field_description:
        'Die Redirect-URI ist die Adresse, zu der Benutzer nach der SSO-Authentifizierung zurückgeleitet werden. Fügen Sie diese URI zur Konfiguration Ihres IdP hinzu.',
      redirect_uri_field_custom_domain_description:
        'Wenn Sie in Logto mehrere <a>benutzerdefinierte Domains</a> verwenden, fügen Sie alle entsprechenden Callback-URIs zu Ihrem IdP hinzu, damit SSO in jeder Domain funktioniert.\n\nDie standardmäßige Logto-Domain (*.logto.app) ist immer gültig – fügen Sie sie nur hinzu, wenn Sie auch SSO unter dieser Domain unterstützen möchten.',
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
      scope_field_placeholder: 'Geben Sie die Bereiche ein (durch ein Leerzeichen getrennt)',
    },
  },
};

export default Object.freeze(enterprise_sso);
