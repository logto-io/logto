const inline_hooks = {
  page_title: '内联钩子',
  title: '内联钩子',
  subtitle: '在身份验证流程的特定节点运行自定义代码，以扩展 Logto 的行为。',
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
};

export default Object.freeze(inline_hooks);
