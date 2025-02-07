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
};

export default Object.freeze(single_sign_on);
