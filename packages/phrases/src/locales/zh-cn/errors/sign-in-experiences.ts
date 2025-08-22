const sign_in_experiences = {
  empty_content_url_of_terms_of_use: '你启用了“使用条款”，请添加使用条款 URL。',
  empty_social_connectors: '你启用了社交登录的方式。请至少选择一个社交连接器。',
  enabled_connector_not_found: '未找到已启用的 {{type}} 连接器',
  not_one_and_only_one_primary_sign_in_method: '主要的登录方式必须有且仅有一个，请检查你的输入。',
  username_requires_password: '必须为用户名注册标识符启用设置密码。',
  passwordless_requires_verify: '必须为电子邮件/电话注册标识符启用验证。',
  miss_sign_up_identifier_in_sign_in: '登录方法必须包含注册标识符。',
  password_sign_in_must_be_enabled: '必须在注册中要求设置密码时启用密码登录。',
  code_sign_in_must_be_enabled: '必须在注册中不要求设置密码时启用验证码登录。',
  unsupported_default_language: '{{language}} 无法选择为默认语言。',
  at_least_one_authentication_factor: '至少要选择一个登录要素',
  backup_code_cannot_be_enabled_alone: '无法仅启用备份代码。',
  duplicated_mfa_factors: '重复的 MFA 要素。',
  email_verification_code_cannot_be_used_for_mfa:
    '当启用了电子邮件登录验证时，电子邮件验证码无法用于 MFA。',
  phone_verification_code_cannot_be_used_for_mfa:
    '当启用了短信登录验证时，短信验证码无法用于 MFA。',
  email_verification_code_cannot_be_used_for_sign_in:
    '当启用了 MFA 时，电子邮件验证码无法用于登录。',
  phone_verification_code_cannot_be_used_for_sign_in: '当启用了 MFA 时，短信验证码无法用于登录。',
  duplicated_sign_up_identifiers: '检测到重复的注册标识符。',
  missing_sign_up_identifiers: '主要的注册标识符不能为空。',
  invalid_custom_email_blocklist_format:
    '无效的自定义电子邮件黑名单项目：{{items, list(type:conjunction)}}。每个项目必须是有效的电子邮件地址或电子邮件域，例如，foo@example.com 或 @example.com。',
  forgot_password_method_requires_connector: '忘记密码方法需要配置相应的 {{method}} 连接器。',
};

export default Object.freeze(sign_in_experiences);
