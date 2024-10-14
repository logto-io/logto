const single_sign_on = {
  forbidden_domains: 'Public email domains are not allowed.',
  duplicated_domains: 'There are duplicate domains.',
  invalid_domain_format: 'Invalid domain format.',
  duplicate_connector_name: 'Connector name already exists. Please choose a different name.',
  idp_initiated_authentication_not_supported:
    'IdP-initiated authentication is exclusively supported for SAML connectors.',
  idp_initiated_authentication_invalid_application_type:
    'Invalid application type. Only {{type}} applications are allowed.',
  idp_initiated_authentication_redirect_uri_not_registered:
    'The redirect_uri is not registered. Please check the application settings.',
};

export default Object.freeze(single_sign_on);
