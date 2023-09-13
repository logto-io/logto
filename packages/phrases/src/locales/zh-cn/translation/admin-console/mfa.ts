const mfa = {
  title: '多因素身份验证',
  description: '添加多因素身份验证以提升您的登录体验的安全性。',
  factors: '因素',
  multi_factors: '多因素',
  multi_factors_description: '用户需要验证启用的一个因素以进行两步验证。',
  totp: 'Authenticator应用程序OTP',
  otp_description: '链接Google Authenticator等来验证一次性密码。',
  webauthn: 'WebAuthn',
  webauthn_description: 'WebAuthn使用通行密钥验证用户设备，包括YubiKey。',
  backup_code: '备用代码',
  backup_code_description: '生成10个唯一的代码，每个代码可用于一次验证。',
  backup_code_setup_hint: '不能单独启用的备用身份验证因素：',
  backup_code_error_hint: '要使用备用代码进行多因素身份验证，必须启用其他因素以确保用户成功登录。',
  policy: '策略',
  two_step_sign_in_policy: '登录时的两步验证策略',
  two_step_sign_in_policy_description: '为登录时的应用程序定义双重验证要求。',
  user_controlled: '用户控制',
  user_controlled_description: '默认情况下禁用且非强制，但用户可以单独启用它。',
  mandatory: '强制',
  mandatory_description: '要求所有用户在每次登录时进行多因素身份验证。',
  unlock_reminder:
    '解锁多因素身份验证以通过升级到付费计划验证安全性。如果需要帮助，请随时<a>联系我们</a>。',
  view_plans: '查看计划',
};

export default Object.freeze(mfa);
