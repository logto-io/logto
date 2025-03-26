const sign_in_experiences = {
  empty_content_url_of_terms_of_use: '你啟用了「使用條款」，請加入使用條款 URL。',
  empty_social_connectors: '你啟用了社交登錄的方式。請至少選擇一個社交連接器。',
  enabled_connector_not_found: '未找到已啟用的 {{type}} 連接器',
  not_one_and_only_one_primary_sign_in_method:
    '主要的登錄方式一定要有且只能有一個，請檢查你的輸入。',
  username_requires_password: '必須為用戶名註冊標識符啟用設置密碼。',
  passwordless_requires_verify: '必須為電郵/電話註冊標識符啟用驗證。',
  miss_sign_up_identifier_in_sign_in: '登錄方法一定要包含註冊標識符。',
  password_sign_in_must_be_enabled: '必須在註冊中要求設置密碼時啟用密碼登錄。',
  code_sign_in_must_be_enabled: '必須在註冊中不要求設置密碼時啟用驗證碼登錄。',
  unsupported_default_language: '{{language}} 無法選擇作為默認語言。',
  at_least_one_authentication_factor: '至少要選擇一個登錄要素',
  backup_code_cannot_be_enabled_alone: 'Backup code cannot be enabled alone.',
  duplicated_mfa_factors: 'Duplicated MFA factors.',
  duplicated_sign_up_identifiers: '檢測到重複的註冊標識符。',
  missing_sign_up_identifiers: '主要的註冊標識符不能為空。',
};

export default Object.freeze(sign_in_experiences);
