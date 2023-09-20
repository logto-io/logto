const mfa = {
  totp: '身份驗證器應用程式 OTP',
  webauthn: 'Passkey',
  backup_code: '備用碼',
  link_totp_description: '連結 Google Authenticator 等',
  link_webauthn_description: '連結您的設備或 USB 硬體',
  link_backup_code_description: '產生備用碼',
  verify_totp_description: '在應用程式中輸入一次性代碼',
  verify_webauthn_description: '驗證您的設備或 USB 硬體',
  verify_backup_code_description: '貼上您儲存的備用碼',
  add_mfa_factors: '新增雙因素驗證',
  add_mfa_description: '已啟用雙因素驗證。選擇第二種驗證方式以安全登錄您的帳戶。',
  verify_mfa_factors: '雙因素驗證',
  verify_mfa_description: '此帳戶已啟用雙因素驗證。請選擇第二種方式驗證您的身份。',
  add_authenticator_app: '新增身份驗證應用程式',
  step: '步驟 {{step, number}}：{{content}}',
  scan_qr_code: '掃描此 QR 碼',
  scan_qr_code_description:
    '使用身份驗證應用程式（例如 Google Authenticator、Duo Mobile、Authy 等）掃描此 QR 碼。',
  qr_code_not_available: '無法掃描 QR 碼？',
  copy_and_paste_key: '複製並貼上金鑰',
  copy_and_paste_key_description:
    '將以下金鑰貼入您的身份驗證應用程式，例如 Google Authenticator、Duo Mobile、Authy 等。',
  want_to_scan_qr_code: '想要掃描 QR 碼嗎？',
  enter_one_time_code: '輸入一次性代碼',
  enter_one_time_code_link_description: '輸入身份驗證應用程式生成的 6 位數字驗證碼。',
  enter_one_time_code_description:
    '此帳戶已啟用雙因素驗證。請輸入您連接的身份驗證應用程式上顯示的一次性代碼。',
  link_another_mfa_factor: '連結其他雙因素驗證方式',
  save_backup_code: '儲存您的備用碼',
  save_backup_code_description:
    '如果您在其他方式的雙因素驗證期間遇到問題，您可以使用其中一個備用碼來訪問您的帳戶。每個代碼只能使用一次。',
  backup_code_hint: '請確保將其複製並儲存在安全的地方。',
  enter_backup_code_description: '輸入您首次啟用雙因素驗證時儲存的備用碼。',
  create_a_passkey: '建立 Passkey',
  create_passkey_description:
    '註冊 Passkey 以通過您的設備密碼或生物辨識、掃描 QR 碼或使用 USB 安全金鑰（例如 YubiKey）進行驗證。',
  name_your_passkey: '為您的 Passkey 命名',
  name_passkey_description: '您已成功驗證此設備用於雙因素驗證。自訂名稱以識別多個 Passkey。',
  try_another_verification_method: '嘗試其他驗證方法',
  verify_via_passkey: '通過 Passkey 驗證',
  verify_via_passkey_description:
    '使用 Passkey 進行驗證，以通過您的設備密碼或生物辨識、掃描 QR 碼或使用 USB 安全金鑰（例如 YubiKey）進行驗證。',
  secret_key_copied: '已複製秘密金鑰。',
  backup_code_copied: '已複製備用碼。',
};

export default Object.freeze(mfa);
