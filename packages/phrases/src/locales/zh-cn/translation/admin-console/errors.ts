const errors = {
  something_went_wrong: '哎呀，出错了！',
  page_not_found: '找不到页面',
  unknown_server_error: '服务器发生未知错误',
  empty: '没有数据',
  missing_total_number: '无法从返回的头部信息中找到 Total-Number',
  invalid_uri_format: '无效的 URI 格式',
  invalid_origin_format: '无效的 URI origin 格式',
  invalid_json_format: '无效的 JSON 格式',
  invalid_regex: '无效的正则表达式',
  invalid_error_message_format: '非法的错误信息格式',
  required_field_missing: '请输入{{field}}',
  required_field_missing_plural: '至少需要输入一个{{field}}',
  more_details: '查看详情',
  username_pattern_error: '用户名只能包含英文字母、数字或下划线，且不以数字开头。',
  email_pattern_error: '邮箱地址无效',
  phone_pattern_error: '手机号码无效',
  insecure_contexts: '不支持不安全的上下文（非 HTTPS）。',
  unexpected_error: '发生未知错误',
  not_found: '404 找不到资源',
  create_internal_role_violation:
    '你正在创建一个被 Logto 禁止内部角色。尝试使用不以 "#internal:" 开头的其他名称。',
  should_be_an_integer: '应该是整数。',
  number_should_be_between_inclusive: '然后数字应该在 {{min}} 到 {{max}} 之间（两端都包括）。',
};

export default Object.freeze(errors);
