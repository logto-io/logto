const errors = {
  something_went_wrong: '哎呀，出错了！',
  page_not_found: '找不到页面',
  unknown_server_error: '服务器发生未知错误',
  empty: '没有数据',
  missing_total_number: '无法从返回的头部信息中找到 Total-Number',
  invalid_uri_format: '无效的 URI 格式',
  invalid_origin_format: '无效的 URI origin 格式',
  invalid_json_format: '无效的 JSON 格式',
  invalid_error_message_format: '非法的错误信息格式',
  required_field_missing: '请输入{{field}}',
  required_field_missing_plural: '至少需要输入一个{{field}}',
  more_details: '查看详情',
  username_pattern_error: '用户名只能包含英文字母、数字或下划线，且不以数字开头。',
  password_pattern_error: '密码至少需要 {{min}} 个字符，且必须包含字母、数字和符号。',
  insecure_contexts: '不支持不安全的上下文（非 HTTPS）。',
  unexpected_error: '发生未知错误',
  not_found: '404 not found', // UNTRANSLATED
};

export default errors;
