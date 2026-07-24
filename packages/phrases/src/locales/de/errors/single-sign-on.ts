const single_sign_on = {
  forbidden_domains: 'Öffentliche E-Mail-Domänen sind nicht erlaubt.',
  duplicated_domains: 'Es gibt doppelte Domänen.',
  invalid_domain_format: 'Ungültiges Domänenformat.',
  duplicate_connector_name: 'Connector name already exists. Bitte wählen Sie einen anderen Namen.',
  idp_initiated_authentication_not_supported:
    'IdP-initiierte Authentifizierung wird ausschließlich für SAML-Connectoren unterstützt.',
  idp_initiated_authentication_invalid_application_type:
    'Ungültiger Anwendungstyp. Nur {{type}} Anwendungen sind erlaubt.',
  idp_initiated_authentication_redirect_uri_not_registered:
    'Die redirect_uri ist nicht registriert. Bitte überprüfe die Anwendungseinstellungen.',
  idp_initiated_authentication_client_callback_uri_not_found:
    'Die Client-IdP-initiierte Authentifizierungs-Callback-URI wurde nicht gefunden. Bitte überprüfe die Connector-Einstellungen.',
  sso_signing_unavailable:
    'Die Anmeldung über Ihren Identitätsanbieter konnte nicht abgeschlossen werden. Bitte wenden Sie sich an Ihren Administrator.',
  can_not_delete_active_signing_key:
    'Der aktive Signaturschlüssel kann nicht gelöscht werden. Aktivieren Sie zuerst einen anderen Schlüssel oder deaktivieren Sie diesen Schlüssel.',
  can_not_deactivate_signing_key_in_use:
    'Der Signaturschlüssel kann nicht deaktiviert werden, solange signierte Authentifizierungsanfragen aktiviert sind. Deaktivieren Sie zuerst signierte Authentifizierungsanfragen.',
  active_signing_key_required:
    'Kein aktiver Signaturschlüssel gefunden. Generieren und aktivieren Sie einen Signaturschlüssel, bevor Sie signierte Authentifizierungsanfragen aktivieren.',
};

export default Object.freeze(single_sign_on);
