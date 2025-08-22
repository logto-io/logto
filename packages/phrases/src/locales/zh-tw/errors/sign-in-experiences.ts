const sign_in_experiences = {
  empty_content_url_of_terms_of_use: '你啟用了“使用條款”，請添加使用條款 URL。',
  empty_social_connectors: '你啟用了社交登錄的方式。請至少選擇一個社交連接器。',
  enabled_connector_not_found: '未找到已啟用的 {{type}} 連接器',
  not_one_and_only_one_primary_sign_in_method: '主要的登錄方式必須有且僅有一個，請檢查你的輸入。',
  username_requires_password: '必須為用戶名註冊識別符啟用設置密碼。',
  passwordless_requires_verify: '必須為電子郵件/電話註冊識別符啟用驗證。',
  miss_sign_up_identifier_in_sign_in: '登錄方法必須包含註冊識別符。',
  password_sign_in_must_be_enabled: '必須在註冊中要求設置密碼時啟用密碼登錄。',
  code_sign_in_must_be_enabled: '必須在註冊中不要求設置密碼時啟用驗證碼登錄。',
  unsupported_default_language: '{{language}} 無法選擇為默認語言。',
  at_least_one_authentication_factor: '至少要選擇一個登錄要素',
  backup_code_cannot_be_enabled_alone: '備份碼不能單獨啟用。',
  duplicated_mfa_factors: '重複的 MFA 要素。',
  email_verification_code_cannot_be_used_for_mfa:
    '當啟用電子郵件驗證用於登錄時，電子郵件驗證碼不能用於 MFA。',
  phone_verification_code_cannot_be_used_for_mfa:
    '當啟用 SMS 驗證用於登錄時，SMS 驗證碼不能用於 MFA。',
  email_verification_code_cannot_be_used_for_sign_in:
    '當電子郵件驗證碼啟用用於 MFA 時，不能用於登錄。',
  phone_verification_code_cannot_be_used_for_sign_in:
    '當 SMS 驗證碼啟用用於 MFA 時，不能用於登錄。',
  duplicated_sign_up_identifiers: '檢測到重複的註冊識別符。',
  missing_sign_up_identifiers: '主要註冊識別符不能為空。',
  invalid_custom_email_blocklist_format:
    '無效的自訂電子郵件封鎖清單項目：{{items, list(type:conjunction)}}。每個項目必須是有效的電子郵件地址或電子郵件域，例如：foo@example.com 或 @example.com。',
  forgot_password_method_requires_connector: '忘記密碼方法需要配置對應的 {{method}} 連接器。',
};

export default Object.freeze(sign_in_experiences);
