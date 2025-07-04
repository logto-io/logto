const custom_profile_fields = {
  entity_not_exists_with_names: '无法找到具有给定名称的实体：{{names}}',
  invalid_min_max_input: '最小值和最大值输入无效。',
  invalid_options: '字段选项无效。',
  invalid_regex_format: '正则表达式格式无效。',
  invalid_address_parts: '地址部分无效。',
  invalid_fullname_parts: '全名部分无效。',
  name_exists: '已存在具有该名称的字段。',
  conflicted_sie_order: '登录体验的字段顺序值冲突。',
  invalid_name: '无效的字段名称，只允许字母或数字，区分大小写。',
  name_conflict_sign_in_identifier: '无效的字段名称。{{name}} 是保留的登录标识符键。',
  name_conflict_custom_data: '无效的字段名称。{{name}} 是保留的自定义数据键。',
};

export default Object.freeze(custom_profile_fields);
