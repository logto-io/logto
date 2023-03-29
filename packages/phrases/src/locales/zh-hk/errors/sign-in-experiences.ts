const sign_in_experiences = {
  empty_content_url_of_terms_of_use: '你啟用咗「使用條款」，請加入使用條款 URL。',
  empty_social_connectors: '你啟用咗社交登錄嘅方式。請至少揀一個社交連接器。',
  enabled_connector_not_found: '未搵到咗已啟用嘅 {{type}} 連接器',
  not_one_and_only_one_primary_sign_in_method:
    '主要嘅登錄方式一定要有並且只有一個，請檢查你嘅輸入。',
  username_requires_password: '必須為用戶名註冊標識符啟用設置密碼。',
  passwordless_requires_verify: '必須為電郵/電話註冊標識符啟用驗證。',
  miss_sign_up_identifier_in_sign_in: '登錄方法一定要包含註冊標識符。',
  password_sign_in_must_be_enabled: '必須喺註冊中要求設置密碼時啟用密碼登錄。',
  code_sign_in_must_be_enabled: '必須喺註冊中唔要求設置密碼時啟用驗證碼登錄。',
  unsupported_default_language: '{{language}} 無法選擇做默認語言。',
  at_least_one_authentication_factor: '至少要揀一個登錄要素',
};

export default sign_in_experiences;
