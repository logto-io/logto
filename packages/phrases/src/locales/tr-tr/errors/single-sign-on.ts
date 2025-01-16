const single_sign_on = {
  forbidden_domains: 'Genel e-posta alanı domainleri izin verilmiyor.',
  duplicated_domains: 'Yinelenmiş domainler bulunmaktadır.',
  invalid_domain_format: 'Geçersiz domain formatı.',
  duplicate_connector_name: 'Bağlayıcı adı zaten var. Lütfen farklı bir ad seçin.',
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
