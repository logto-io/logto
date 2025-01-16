const single_sign_on = {
  forbidden_domains: 'Los dominios de correo electrónico público no están permitidos.',
  duplicated_domains: 'Hay dominios duplicados.',
  invalid_domain_format: 'Formato de dominio no válido.',
  duplicate_connector_name:
    'El nombre del conector ya existe. Por favor elige un nombre diferente.',
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
