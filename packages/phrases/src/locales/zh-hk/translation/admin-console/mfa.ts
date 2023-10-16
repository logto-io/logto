const mfa = {
  title: '多因子驗證',
  description: '添加多因子驗證以提升您的登錄體驗的安全性。',
  factors: '因素',
  multi_factors: '多因素',
  multi_factors_description: '用戶需要驗證啟用的一個因素以進行兩步驗證。',
  totp: 'Authenticator應用程式OTP',
  otp_description: '連接Google Authenticator等來驗證一次性密碼。',
  webauthn: 'WebAuthn',
  webauthn_description: 'WebAuthn使用通行密鑰驗證用戶設備，包括YubiKey。',
  backup_code: '備用代碼',
  backup_code_description: '生成10個唯一的代碼，每個代碼可用於一次驗證。',
  backup_code_setup_hint: '不能單獨啟用的備用身份驗證因素：',
  backup_code_error_hint: '要使用備用代碼進行多因子驗證，必須啟用其他因素以確保用戶成功登錄。',
  policy: '策略',
  two_step_sign_in_policy: '登錄時的雙重驗證策略',
  user_controlled: '用戶可以個人選擇啟用MFA。',
  mandatory: '每次登錄時對所有用戶強制執行MFA。',
  unlock_reminder:
    '解鎖多因子驗證以通過升級到付費計劃驗證安全性。如果需要幫助，請隨時<a>聯繫我們</a>。',
  view_plans: '查看計劃',
};

export default Object.freeze(mfa);
