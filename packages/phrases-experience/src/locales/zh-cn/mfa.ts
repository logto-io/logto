const mfa = {
  totp: '身份验证器应用程序 OTP',
  webauthn: 'Passkey',
  backup_code: '备用码',
  link_totp_description: '关联 Google Authenticator 等',
  link_webauthn_description: '关联您的设备或 USB 硬件',
  link_backup_code_description: '生成备用码',
  verify_totp_description: '在应用中输入一次性代码',
  verify_webauthn_description: '验证您的设备或 USB 硬件',
  verify_backup_code_description: '粘贴您保存的备用码',
  add_mfa_factors: '添加两步验证',
  add_mfa_description: '已启用两步验证。选择第二种验证方式以安全登录您的帐户。',
  verify_mfa_factors: '两步验证',
  verify_mfa_description: '此帐户已启用两步验证。请选择第二种方式验证您的身份。',
  add_authenticator_app: '添加身份验证器应用',
  step: '步骤 {{step, number}}：{{content}}',
  scan_qr_code: '扫描此 QR 码',
  scan_qr_code_description:
    '使用身份验证器应用（如 Google Authenticator、Duo Mobile、Authy 等）扫描此 QR 码。',
  qr_code_not_available: '无法扫描 QR 码？',
  copy_and_paste_key: '复制并粘贴密钥',
  copy_and_paste_key_description:
    '将下面的密钥粘贴到您的身份验证器应用中，如 Google Authenticator、Duo Mobile、Authy 等。',
  want_to_scan_qr_code: '想要扫描 QR 码吗？',
  enter_one_time_code: '输入一次性代码',
  enter_one_time_code_link_description: '输入身份验证器应用生成的 6 位验证码。',
  enter_one_time_code_description:
    '此帐户已启用两步验证。请输入您连接的身份验证器应用中显示的一次性代码。',
  link_another_mfa_factor: '关联另一种两步验证方式',
  save_backup_code: '保存备用码',
  save_backup_code_description:
    '如果您在其他方式的两步验证期间遇到问题，您可以使用这些备用码之一来访问您的帐户。每个代码只能使用一次。',
  backup_code_hint: '确保复制并保存在安全的地方。',
  enter_backup_code_description: '在首次启用两步验证时保存的备用码。',
  create_a_passkey: '创建 Passkey',
  create_passkey_description:
    '注册一个 Passkey，以通过设备密码或生物识别、扫描 QR 码或使用类似 YubiKey 的 USB 安全密钥进行验证。',
  name_your_passkey: '为您的 Passkey 命名',
  name_passkey_description: '您已成功验证此设备用于两步验证。自定义名称以识别多个密钥。',
  try_another_verification_method: '尝试其他验证方法',
  verify_via_passkey: '通过 Passkey 验证',
  verify_via_passkey_description:
    '使用 Passkey 通过设备密码或生物识别、扫描 QR 码或使用类似 YubiKey 的 USB 安全密钥进行验证。',
  secret_key_copied: '已复制秘钥。',
  backup_code_copied: '已复制备用码。',
};

export default Object.freeze(mfa);
