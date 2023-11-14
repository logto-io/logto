const mfa = {
  title: '多因素身份驗證',
  description: '添加多因素身份驗證以提升您登錄體驗的安全性。',
  factors: '因素',
  multi_factors: '多因素',
  multi_factors_description: '用戶需要驗證啟用的其中一個因素以進行兩步驗證。',
  totp: '身份驗證應用 OTP',
  otp_description: '將 Google Authenticator 等連接起來，以驗證一次性密碼。',
  webauthn: 'WebAuthn（通行證）',
  webauthn_description: '通過瀏覽器支持的方法進行驗證：生物識別、手機掃描或安全密鑰等。',
  webauthn_native_tip: '本地應用不支持 WebAuthn。',
  webauthn_domain_tip:
    'WebAuthn將公共密鑰綁定到特定域。修改服務域將阻止用戶通過現有通行證進行身份驗證。',
  backup_code: '備份代碼',
  backup_code_description: '在用戶設置任何MFA方法後生成10個一次性備份代碼。',
  backup_code_setup_hint: '當用戶無法驗證上述MFA因素時，使用備份選項。',
  backup_code_error_hint: '要使用備份代碼，您需要至少再添加一種MFA方法以成功進行用戶身份驗證。',
  policy: '策略',
  policy_description: '設置登錄和註冊流程的MFA策略。',
  two_step_sign_in_policy: '登錄時的雙步驗證策略',
  user_controlled: '用戶可以自行啟用或禁用MFA',
  user_controlled_tip: '用戶可以在首次登錄或註冊時跳過MFA設置，或在帳戶設置中啟用/禁用它。',
  mandatory: '用戶總是需要在登錄時使用MFA',
  mandatory_tip: '用戶必須在首次登錄或註冊時設置MFA，並在以後的所有登錄中使用它。',
};

export default Object.freeze(mfa);
