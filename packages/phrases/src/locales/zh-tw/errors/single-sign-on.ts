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
  sso_signing_unavailable: '無法透過您的身分提供者完成登入。請聯絡管理員。',
  can_not_delete_active_signing_key: '無法刪除目前啟用的簽署金鑰。請先啟用其他金鑰或停用此金鑰。',
  can_not_deactivate_signing_key_in_use:
    '簽署驗證請求已開啟時無法停用簽署金鑰。請先關閉簽署驗證請求。',
  active_signing_key_required:
    '找不到已啟用的簽署金鑰。請先產生並啟用簽署金鑰，再開啟簽署驗證請求。',
};

export default Object.freeze(single_sign_on);
