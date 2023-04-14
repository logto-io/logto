const errors = {
  something_went_wrong: '哎呀，出錯了！',
  page_not_found: '找不到頁面',
  unknown_server_error: '伺服器發生未知錯誤',
  empty: '沒有資料',
  missing_total_number: '無法從返回的頭部訊息中找到 Total-Number',
  invalid_uri_format: '無效的 URI 格式',
  invalid_origin_format: '無效的 URI origin 格式',
  invalid_json_format: '無效的 JSON 格式',
  invalid_error_message_format: '非法的錯誤訊息格式',
  required_field_missing: '請輸入{{field}}',
  required_field_missing_plural: '至少需要輸入一個{{field}}',
  more_details: '查看詳情',
  username_pattern_error: '用戶名只能包含英文字母、數字或下劃線，且不以數字開頭。',
  password_pattern_error: '密碼至少需要{{min}}個字符，且必須包含字母、數字和符號。',
  email_pattern_error: '郵箱地址無效',
  phone_pattern_error: '手機號碼無效',
  insecure_contexts: '不支援不安全的上下文（非 HTTPS）。',
  unexpected_error: '發生未知錯誤',
  not_found: '404 找不到資源',
  create_internal_role_violation:
    '你正在創建一個被 Logto 禁止的內部角色。嘗試使用不以 "#internal:" 開頭的其他名稱。',
};

export default errors;
