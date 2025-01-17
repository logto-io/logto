const single_sign_on = {
  forbidden_domains: '공개 이메일 도메인은 허용되지 않습니다.',
  duplicated_domains: '중복된 도메인이 있습니다.',
  invalid_domain_format: '도메인 형식이 잘못되었습니다.',
  duplicate_connector_name: '커넥터 이름이 이미 존재합니다. 다른 이름을 선택해 주세요.',
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
