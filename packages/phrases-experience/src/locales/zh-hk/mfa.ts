const mfa = {
  totp: '身份驗證器應用程式 OTP',
  webauthn: 'Passkey',
  backup_code: '備用碼',
  link_totp_description: '關聯 Google Authenticator 等',
  link_webauthn_description: '關聯您的設備或 USB 硬件',
  link_backup_code_description: '生成備用碼',
  verify_totp_description: '在應用中輸入一次性代碼',
  verify_webauthn_description: '驗證您的設備或 USB 硬件',
  verify_backup_code_description: '粘貼您保存的備用碼',
  add_mfa_factors: '添加兩步驗證',
  add_mfa_description: '已啟用兩步驗證。選擇第二種驗證方式以安全登錄您的帳戶。',
  verify_mfa_factors: '兩步驗證',
  verify_mfa_description: '此帳戶已啟用兩步驗證。請選擇第二種方式驗證您的身份。',
  add_authenticator_app: '添加身份驗證器應用程式',
  step: '步驟 {{step, number}}：{{content}}',
  scan_qr_code: '掃描此 QR 碼',
  scan_qr_code_description:
    '使用身份驗證器應用程式（如 Google Authenticator、Duo Mobile、Authy 等）掃描此 QR 碼。',
  qr_code_not_available: '無法掃描 QR 碼？',
  copy_and_paste_key: '複製並貼上金鑰',
  copy_and_paste_key_description:
    '將下面的金鑰貼入您的身份驗證器應用程式，如 Google Authenticator、Duo Mobile、Authy 等。',
  want_to_scan_qr_code: '想要掃描 QR 碼嗎？',
  enter_one_time_code: '輸入一次性代碼',
  enter_one_time_code_link_description: '輸入身份驗證器應用程式生成的 6 位數驗證碼。',
  enter_one_time_code_description:
    '此帳戶已啟用兩步驗證。請輸入您連接的身份驗證器應用程式中顯示的一次性代碼。',
  link_another_mfa_factor: '關聯另一種兩步驗證方式',
  save_backup_code: '儲存備用碼',
  save_backup_code_description:
    '如果您在其他方式的兩步驗證期間遇到問題，您可以使用這些備用碼之一來訪問您的帳戶。每個代碼只能使用一次。',
  backup_code_hint: '確保複製並儲存在安全的地方。',
  enter_backup_code_description: '在首次啟用兩步驗證時儲存的備用碼。',
  create_a_passkey: '建立 Passkey',
  create_passkey_description:
    '註冊一個 Passkey，以通過設備密碼或生物識別、掃描 QR 碼或使用類似 YubiKey 的 USB 安全金鑰進行驗證。',
  name_your_passkey: '為您的 Passkey 命名',
  name_passkey_description: '您已成功驗證此設備用於兩步驗證。自訂名稱以識別多個金鑰。',
  try_another_verification_method: '嘗試其他驗證方法',
  verify_via_passkey: '通過 Passkey 驗證',
  verify_via_passkey_description:
    '使用 Passkey 通過設備密碼或生物識別、掃描 QR 碼或使用類似 YubiKey 的 USB 安全金鑰進行驗證。',
  secret_key_copied: '已複製秘密金鑰。',
  backup_code_copied: '已複製備用碼。',
};

export default Object.freeze(mfa);
