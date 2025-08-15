const custom_profile_fields = {
  entity_not_exists_with_names: '无法找到具有给定名称的实体：{{names}}',
  invalid_min_max_input: '最小值和最大值输入无效。',
  invalid_default_value: '默认值无效。',
  invalid_options: '字段选项无效。',
  invalid_regex_format: '正则表达式格式无效。',
  invalid_address_components: '地址组件无效。',
  invalid_fullname_components: '全名组件无效。',
  invalid_sub_component_type: '子组件类型无效。',
  name_exists: '已存在具有该名称的字段。',
  conflicted_sie_order: '登录体验的字段顺序值冲突。',
  invalid_name: '无效的字段名称，只允许字母或数字，区分大小写。',
  name_conflict_sign_in_identifier: '无效的字段名称。保留的登录标识符键：{{name}}。',
  name_conflict_built_in_prop: '无效的字段名称。保留的内置用户资料属性名称：{{name}}。',
  name_conflict_custom_data: '无效的字段名称。保留的自定义数据键：{{name}}。',
  name_required: '字段名称是必需的。',
};

export default Object.freeze(custom_profile_fields);
