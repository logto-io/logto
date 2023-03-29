const auth = {
  authorization_header_missing: 'Authorization 請求頭缺失。',
  authorization_token_type_not_supported: 'Authorization token 類型不支持',
  unauthorized: '未經授權。請檢查憑證及其範圍。',
  forbidden: '禁止訪問。請檢查用戶 role 與權限。',
  expected_role_not_found: '未找到期望的 role。請檢查用戶 role 與權限。',
  jwt_sub_missing: 'JWT 缺失 `sub`',
  require_re_authentication: '需要重新認證以進行受保護操作。',
};

export default auth;
