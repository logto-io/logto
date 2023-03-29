const auth = {
  authorization_header_missing: 'Authorization 请求头缺失。',
  authorization_token_type_not_supported: 'Authorization token 类型不支持',
  unauthorized: '未经授权。请检查凭据及其范围。',
  forbidden: '禁止访问。请检查用户 role 与权限。',
  expected_role_not_found: '未找到期望的 role。请检查用户 role 与权限。',
  jwt_sub_missing: 'JWT 缺失 `sub`',
  require_re_authentication: '需要重新认证以进行受保护操作。',
};

export default auth;
