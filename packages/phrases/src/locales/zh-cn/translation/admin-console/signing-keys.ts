const signing_keys = {
  title: '签名密钥',
  description: '安全管理应用程序使用的签名密钥。',
  private_key: 'OIDC 私钥',
  private_keys_description: 'OIDC 私钥用于签署 JWT 令牌。',
  cookie_key: 'OIDC Cookie 密钥',
  cookie_keys_description: 'OIDC Cookie 密钥用于签署 Cookie。',
  private_keys_in_use: '正在使用的私钥',
  cookie_keys_in_use: '正在使用的 Cookie 密钥',
  rotate_private_keys: '旋转私钥',
  rotate_cookie_keys: '旋转 Cookie 密钥',
  rotate_private_keys_description:
    '此操作将创建一个新的私钥，旋转当前密钥，并删除之前的密钥。使用当前密钥签名的JWT令牌将在删除或另一轮旋转之前保持有效。',
  rotate_cookie_keys_description:
    '此操作将创建一个新的Cookie密钥，旋转当前密钥，并删除之前的密钥。使用当前密钥签名的Cookie将在删除或另一轮旋转之前保持有效。',
  select_private_key_algorithm: '为新的私钥选择签名密钥算法',
  rotate_button: '旋转',
  table_column: {
    id: 'ID',
    status: '状态',
    algorithm: '签名密钥算法',
  },
  status: {
    current: '当前',
    previous: '之前',
  },
  reminder: {
    rotate_private_key:
      '您确定要旋转<strong>OIDC私钥</strong>吗？新发布的JWT令牌将由新密钥签名。使用当前密钥签名的现有JWT令牌将在您再次旋转之前保持有效。',
    rotate_cookie_key:
      '您确定要旋转<strong>OIDC Cookie密钥</strong>吗？登录会话生成的新Cookie将由新Cookie密钥签名。使用当前密钥签名的现有Cookie将在您再次旋转之前保持有效。',
    delete_private_key:
      '您确定要删除<strong>OIDC私钥</strong>吗？使用此私有签名密钥签名的现有JWT令牌将不再有效。',
    delete_cookie_key:
      '您确定要删除<strong>OIDC Cookie密钥</strong>吗？用此Cookie密钥签名的旧登录会话将不再有效。这些用户需要重新验证。',
  },
  messages: {
    rotate_key_success: '签名密钥旋转成功。',
    delete_key_success: '密钥已成功删除。',
  },
};

export default Object.freeze(signing_keys);
