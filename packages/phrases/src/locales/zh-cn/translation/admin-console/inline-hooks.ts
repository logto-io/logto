const inline_hooks = {
  page_title: '内联钩子',
  title: '内联钩子',
  subtitle: '在身份验证流程的特定节点运行自定义代码，以扩展 Logto 的行为。',
  details_page_title: '{{name}}',
  status: {
    not_configured: '未配置',
    configured: '已配置',
    enabled: '已启用',
    disabled: '已停用',
  },
  hooks: {
    post_first_factor_verification: {
      name: '首个身份验证因素验证后',
      description: '在首个身份验证因素通过验证后、登录继续前运行自定义逻辑。',
    },
    post_sign_in: {
      name: '登录后',
      description: '在用户成功登录后运行自定义逻辑。',
    },
  },
  data_source_tab: '数据源',
  test_tab: '测试上下文',
  settings_tab: '设置',
  event_data: {
    title: '事件载荷',
    subtitle: '使用 `event` 输入参数获取身份验证事件数据。',
  },
  result_data: {
    title: '钩子结果',
    subtitle: '返回 Logto 可理解的结果对象，以适配此钩子类型。',
  },
  environment_variables: {
    title: '设置环境变量',
    subtitle: '使用环境变量存储敏感信息。',
    input_field_title: '添加环境变量',
    sample_code: '在内联钩子处理程序中访问环境变量。示例：',
  },
  fetch_external_data: {
    title: '获取外部数据',
    subtitle: '在钩子脚本中调用外部 API。',
    description: '使用 `fetch` 函数调用外部 API，并将数据包含在钩子结果中。示例：',
  },
  settings: {
    title: '设置',
    subtitle: '控制钩子是否启用，以及运行时错误的处理方式。',
    enabled: {
      title: '启用钩子',
      description: '在身份验证事件触发时运行此脚本。',
    },
    on_execution_error: {
      title: '脚本出错时',
      description: '选择脚本运行失败时 Logto 的行为。',
      block: '阻止身份验证流程',
      allow: '允许身份验证流程继续',
      post_first_factor_description:
        '当此脚本失败时，Logto 始终拒绝无效凭证，以确保无法绕过密码验证。',
    },
  },
  test_context: {
    subtitle: '调整运行测试时使用的模拟事件载荷。',
    input_field_title: '事件示例 JSON',
  },
  script: {
    title: '脚本',
    restore: '恢复默认值',
    restored: '已恢复',
  },
  tester: {
    run_button: '运行测试',
    result_title: '测试结果',
  },
  form_error: {
    invalid_json: '无效的 JSON 格式',
  },
  security_warning: {
    title: '安全警告',
    description:
      '通过此钩子创建的用户会绕过仅适用于注册的限制，包括邮箱黑名单、仅 SSO 域名、禁用注册模式，以及注册必填资料检查。对已有用户的资料和密码写入也会在 MFA 完成前发生。',
  },
  delete_modal_title: '删除内联钩子',
  delete_modal_content: '确定要删除此内联钩子吗？身份验证流程将不再运行此脚本。',
  deleted: '内联钩子已删除',
  created: '内联钩子已创建',
  saved: '内联钩子已保存',
};

export default Object.freeze(inline_hooks);
