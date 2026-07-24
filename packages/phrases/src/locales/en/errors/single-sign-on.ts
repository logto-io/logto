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
  idp_initiated_authentication_client_callback_uri_not_found:
    'The client IdP-initiated authentication callback URI is not found. Please check the connector settings.',
  sso_signing_unavailable:
    "We couldn't complete sign-in with your identity provider. Please contact your administrator.",
  can_not_delete_active_signing_key:
    'Cannot delete the active signing key. Activate another key or deactivate this key first.',
  can_not_deactivate_signing_key_in_use:
    'Cannot deactivate the signing key while signed authentication requests are enabled. Disable signed authentication requests first.',
  active_signing_key_required:
    'No active signing key found. Generate and activate a signing key before enabling signed authentication requests.',
};

export default Object.freeze(single_sign_on);
