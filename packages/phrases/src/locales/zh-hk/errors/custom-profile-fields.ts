const custom_profile_fields = {
  entity_not_exists_with_names: '找不到具備以下名稱的實體：{{names}}',
  invalid_min_max_input: '最小值與最大值輸入無效。',
  invalid_default_value: '預設值無效。',
  invalid_options: '欄位選項無效。',
  invalid_regex_format: '正則表達式格式無效。',
  invalid_address_components: '地址組件無效。',
  invalid_fullname_components: '全名組件無效。',
  invalid_sub_component_type: '子組件類型無效。',
  name_exists: '已有具有該名稱的欄位存在。',
  conflicted_sie_order: '登入體驗欄位順序值有衝突。',
  invalid_name: '欄位名稱無效，只允許字母或數字，區分大小寫。',
  name_conflict_sign_in_identifier: '欄位名稱無效。保留的登入識別鍵：{{name}}。',
  name_conflict_built_in_prop: '欄位名稱無效。保留的內置用戶資料屬性名稱：{{name}}。',
  name_conflict_custom_data: '欄位名稱無效。保留的自定義資料鍵：{{name}}。',
  name_required: '欄位名稱為必填項。',
};

export default Object.freeze(custom_profile_fields);
