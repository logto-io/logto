const jwt_claims = {
  title: '自定义JWT',
  description: '设置自定义JWT声明以包含在访问令牌中。这些声明可以用于向应用程序传递附加信息。',
  user_jwt: {
    card_title: '对于用户',
    card_field: '用户访问令牌',
    card_description: '在访问令牌发放期间添加用户特定数据。',
    for: '给用户',
  },
  machine_to_machine_jwt: {
    card_title: '对于M2M',
    card_field: '机器间令牌',
    card_description: '在机器间令牌发放期间添加额外数据。',
    for: '给M2M',
  },
  code_editor_title: '自定义{{token}}声明',
  custom_jwt_create_button: '添加自定义声明',
  custom_jwt_item: '自定义声明{{for}}',
  delete_modal_title: '删除自定义声明',
  delete_modal_content: '你确定要删除自定义声明吗？',
  clear: '清除',
  cleared: '已清除',
  restore: '恢复默认',
  restored: '已恢复',
  data_source_tab: '数据来源',
  test_tab: '测试上下文',
  jwt_claims_description: '默认声明会自动包含在JWT中，不能被覆盖。',
  user_data: {
    title: '用户数据',
    subtitle: '使用`data.user`输入参数提供重要用户信息。',
  },
  grant_data: {
    title: '授权数据',
    subtitle: '使用`data.grant`输入参数提供重要的授权信息，仅适用于令牌交换。',
  },
  token_data: {
    title: '令牌数据',
    subtitle: '使用`token`输入参数查看当前访问令牌负载。',
  },
  fetch_external_data: {
    title: '获取外部数据',
    subtitle: '直接将外部API中的数据纳入声明。',
    description: '使用`fetch`函数调用外部API并将数据包含在自定义声明中。示例：',
  },
  environment_variables: {
    title: '设置环境变量',
    subtitle: '使用环境变量存储敏感信息。',
    input_field_title: '添加环境变量',
    sample_code: '在自定义JWT声明处理程序中访问环境变量。示例：',
  },
  jwt_claims_hint: '将自定义声明限制在50KB以下。默认JWT声明会自动包含在令牌中，无法覆盖。',
  tester: {
    subtitle: '调整模拟令牌和用户数据进行测试。',
    run_button: '运行测试',
    result_title: '测试结果',
  },
  form_error: {
    invalid_json: 'JSON格式无效',
  },
};

export default Object.freeze(jwt_claims);
