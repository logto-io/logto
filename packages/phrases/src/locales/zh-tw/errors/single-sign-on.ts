const single_sign_on = {
  forbidden_domains: '不允許使用公共電子郵件域名。',
  duplicated_domains: '存在重複的域名。',
  invalid_domain_format: '無效的域名格式。',
  duplicate_connector_name: '連接器名稱已存在。請選擇不同的名稱。',
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
