const single_sign_on = {
  forbidden_domains: '不允許使用公共電子郵件域名。',
  duplicated_domains: '存在重複的域名。',
  invalid_domain_format: '無效的域名格式。',
  duplicate_connector_name: '連接器名稱已存在。請選擇不同的名稱。',
  idp_initiated_authentication_not_supported: '僅支持 SAML 連接器的 IdP 發起的身份驗證。',
  idp_initiated_authentication_invalid_application_type:
    '應用程式類型無效。只允許使用 {{type}} 應用程式。',
  idp_initiated_authentication_redirect_uri_not_registered:
    '未註冊的 redirect_uri。請檢查應用程式設定。',
  idp_initiated_authentication_client_callback_uri_not_found:
    '未找到客戶端 IdP 發起的身份驗證回調 URI。請檢查連接器設定。',
};

export default Object.freeze(single_sign_on);
