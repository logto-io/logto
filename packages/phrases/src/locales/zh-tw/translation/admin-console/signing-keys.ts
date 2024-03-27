const signing_keys = {
  title: '簽名密鑰',
  description: '安全管理應用程式使用的簽名密鑰。',
  private_key: 'OIDC 私鑰',
  private_keys_description: 'OIDC 私鑰用於簽署 JWT 令牌。',
  cookie_key: 'OIDC cookie 密鑰',
  cookie_keys_description: 'OIDC cookie 密鑰用於簽署 cookie。',
  private_keys_in_use: '正在使用的私鑰',
  cookie_keys_in_use: '正在使用的 Cookie 密鑰',
  rotate_private_keys: '輪換私鑰',
  rotate_cookie_keys: '輪換 Cookie 密鑰',
  rotate_private_keys_description:
    '此操作將創建一個新的私密簽名密鑰，輪換當前密鑰並刪除之前的密鑰。您的使用當前密鑰簽署的 JWT 憑證在刪除或另一輪輪換之前仍然有效。',
  rotate_cookie_keys_description:
    '此操作將創建一個新的 Cookie 密鑰，輪換當前密鑰並刪除之前的密鑰。使用當前密鑰簽署的 Cookie 將在刪除或另一輪輪換之前仍然有效。',
  select_private_key_algorithm: '選擇新私鑰的簽名演算法',
  rotate_button: '輪換',
  table_column: {
    id: 'ID',
    status: '狀態',
    algorithm: '簽名演算法',
  },
  status: {
    current: '當前的',
    previous: '之前的',
  },
  reminder: {
    rotate_private_key:
      '您確定要輪換<strong>OIDC私鑰</strong>嗎？新發放的 JWT 憑證將由新的密鑰簽署。現有的 JWT 憑證仍然有效，直到下一輪輪換或刪除。',
    rotate_cookie_key:
      '您確定要輪換<strong>OIDC Cookie 密鑰</strong>嗎？在登入會話中生成的新 Cookie 將由新的 Cookie 密鑰簽署。現有 Cookie 在下一輪輪換或刪除之前仍然有效。',
    delete_private_key:
      '您確定要刪除<strong>OIDC私鑰</strong>嗎？使用此私密簽名密鑰簽署的現有 JWT 憑證將不再有效。',
    delete_cookie_key:
      '您確定要刪除<strong>OIDC Cookie 密鑰</strong>嗎？用此 Cookie 密鑰簽署的舊登入會話將不再有效。這些使用者需要重新驗證。',
  },
  messages: {
    rotate_key_success: '密鑰輪換成功。',
    delete_key_success: '密鑰刪除成功。',
  },
};

export default Object.freeze(signing_keys);
