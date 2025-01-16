const single_sign_on = {
  forbidden_domains: 'I domini di posta elettronica pubblica non sono consentiti.',
  duplicated_domains: 'Ci sono domini duplicati.',
  invalid_domain_format: 'Formato del dominio non valido.',
  duplicate_connector_name:
    'Il nome del connettore esiste già. Si prega di scegliere un nome diverso.',
  /** UNTRANSLATED */
  idp_initiated_authentication_not_supported:
    'IdP-initiated authentication is exclusively supported for SAML connectors.',
  /** UNTRANSLATED */
  idp_initiated_authentication_invalid_application_type:
    'Invalid application type. Only {{type}} applications are allowed.',
  /** UNTRANSLATED */
  idp_initiated_authentication_redirect_uri_not_registered:
    'The redirect_uri is not registered. Please check the application settings.',
  /** UNTRANSLATED */
  idp_initiated_authentication_client_callback_uri_not_found:
    'The client IdP-initiated authentication callback URI is not found. Please check the connector settings.',
};

export default Object.freeze(single_sign_on);
