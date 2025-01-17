const single_sign_on = {
  forbidden_domains: 'لا يُسمح بنطاقات البريد الإلكتروني العامة.',
  duplicated_domains: 'هناك نطاقات مكررة.',
  invalid_domain_format: 'تنسيق النطاق غير صالح.',
  duplicate_connector_name: 'اسم الموصل مكرر. يرجى اختيار اسم مختلف.',
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
