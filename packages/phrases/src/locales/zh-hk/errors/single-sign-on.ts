const single_sign_on = {
  forbidden_domains: '不允許使用公共電郵域名。',
  duplicated_domains: '存在重複的域名。',
  invalid_domain_format: '無效的域名格式。',
  duplicate_connector_name: '連接器名稱已存在。請選擇不同的名稱。',
  idp_initiated_authentication_not_supported: '僅 SAML 連接器支持 IdP 發起的身份驗證。',
  idp_initiated_authentication_invalid_application_type: '無效的應用類型。僅允許 {{type}} 應用。',
  idp_initiated_authentication_redirect_uri_not_registered: 'redirect_uri 未註冊。請檢查應用設置。',
  idp_initiated_authentication_client_callback_uri_not_found:
    '找不到客戶端 IdP 發起的身份驗證回調 URI。請檢查連接器設置。',
  sso_signing_unavailable: '無法透過你的身分提供者完成登入。請聯絡管理員。',
  can_not_delete_active_signing_key:
    '無法刪除目前啟用的簽署金鑰。請先啟用其他金鑰或關閉簽署驗證請求。',
};

export default Object.freeze(single_sign_on);
