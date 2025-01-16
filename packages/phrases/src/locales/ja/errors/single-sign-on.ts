const single_sign_on = {
  forbidden_domains: 'パブリックメールドメインは許可されていません。',
  duplicated_domains: '重複するドメインがあります。',
  invalid_domain_format: 'ドメインの形式が無効です。',
  duplicate_connector_name: 'コネクタ名が既に存在します。別の名前を選択してください。',
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
