const signing_keys = {
  title: '簽名密鑰',
  description: '安全管理應用程式使用的簽名密鑰。',
  private_key: 'OIDC 私鑰',
  private_keys_description: 'OIDC 私鑰用於簽署 JWT 令牌。',
  cookie_key: 'OIDC cookie 密鑰',
  cookie_keys_description: 'OIDC cookie 密鑰用於簽署 cookie。',
  private_keys_in_use: '正在使用的私密金鑰',
  cookie_keys_in_use: '正在使用的 Cookie 金鑰',
  rotate_private_keys: '旋轉私密金鑰',
  rotate_cookie_keys: '旋轉 Cookie 金鑰',
  rotate_private_keys_description:
    '此操作將創建一個新的私密簽署金鑰，旋轉當前金鑰並刪除以前的金鑰。您的使用當前金鑰簽署的 JWT 標記將保持有效，直到刪除或再次旋轉。',
  rotate_cookie_keys_description:
    '此操作將創建一個新的 cookie 金鑰，旋轉當前金鑰並刪除以前的金鑰。使用當前金鑰簽署的 cookie 將保持有效，直到刪除或再次旋轉。',
  select_private_key_algorithm: '選擇新私密金鑰的簽署算法',
  rotate_button: '旋轉',
  table_column: {
    id: 'ID',
    status: '狀態',
    algorithm: '簽署金鑰算法',
  },
  status: {
    current: '當前',
    previous: '之前',
  },
  reminder: {
    rotate_private_key:
      '您確定要旋轉<strong>OIDC私密金鑰</strong>嗎？使用新金鑰發放的 JWT 標記將由新金鑰簽署。使用當前金鑰簽署的 JWT 標記將保持有效，直到您再次旋轉。',
    rotate_cookie_key:
      '您確定要旋轉<strong>OIDC Cookie金鑰</strong>嗎？在登錄會話中生成的新 cookie 將由新cookie金鑰簽署。使用當前金鑰簽署的cookie將保持有效，直到您再次旋轉。',
    delete_private_key:
      '您確定要刪除<strong>OIDC私密金鑰</strong>嗎？使用此私密簽署金鑰簽署的現有 JWT 標記將不再有效。',
    delete_cookie_key:
      '您確定要刪除<strong>OIDC Cookie金鑰</strong>嗎？使用此cookie金鑰簽署的較舊的登錄會話中的cookie不再有效，這些用戶需要重新驗證。',
  },
  messages: {
    rotate_key_success: '簽署金鑰成功旋轉。',
    delete_key_success: '金鑰成功刪除。',
  },
};

export default Object.freeze(signing_keys);
