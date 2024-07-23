const cloud = {
  general: {
    onboarding: '入门',
  },
  welcome: {
    page_title: '欢迎',
    title: '欢迎来到 Logto Cloud！我们很想了解你。',
    description: '通过更好地了解你，我们可以使你的 Logto 体验更加个性化。你的信息是安全的。',
    project_field: '我使用 Logto 是为了',
    project_options: {
      personal: '个人项目',
      company: '公司项目',
    },
    company_name_field: '公司名称',
    company_name_placeholder: 'Acme.co',
    stage_field: '你的产品目前处于哪个阶段？',
    stage_options: {
      new_product: '开始一个新项目，寻找一个快速的即插即用解决方案',
      existing_product: '从当前的身份验证系统迁移（例如，自建、Auth0、Cognito、Microsoft）',
      target_enterprise_ready: '我刚刚赢得了更大的客户，现在希望让我的产品适应企业销售',
    },
    additional_features_field: '你还有其他想告诉我们的信息么？',
    additional_features_options: {
      customize_ui_and_flow: '构建并管理我的 UI，而不仅仅使用 Logto 预构建和可定制的解决方案',
      compliance: 'SOC2 和 GDPR 是必须的',
      export_user_data: '需要能够从 Logto 导出用户数据',
      budget_control: '我有非常严格的预算控制',
      bring_own_auth: '有自己的身份验证服务，只需要一些 Logto 功能',
      others: '以上都不是',
    },
  },
  create_tenant: {
    page_title: '创建租户',
    title: '创建你的第一个租户',
    description: '租户是一个隔离的环境，你可以在其中管理用户身份、应用程序和所有其他 Logto 资源。',
    invite_collaborators: '通过电子邮件邀请你的合作者',
  },
  sie: {
    page_title: '定制登录体验',
    title: '让我们轻松定制你的登录体验',
    inspire: {
      title: '创建引人入胜的示例',
      description: '对登录体验不确定吗？只需点击“启发我”，让魔法发生！',
      inspire_me: '来点灵感',
    },
    logo_field: '应用商标',
    color_field: '品牌颜色',
    identifier_field: '标识符',
    identifier_options: {
      email: '电子邮件',
      phone: '电话',
      user_name: '用户名',
    },
    authn_field: '身份验证',
    authn_options: {
      password: '密码',
      verification_code: '验证码',
    },
    social_field: '社交登录',
    finish_and_done: '完成并完成',
    preview: {
      mobile_tab: '移动端',
      web_tab: '网页端',
    },
    connectors: {
      unlocked_later: '稍后解锁',
      unlocked_later_tip: '完成入门流程并进入产品后，你将获得访问更多社交登录方式的权限。',
      notice:
        '请勿将演示连接器用于生产目的。 完成测试后，请删除演示连接器并使用你的凭证设置自己的连接器。',
    },
  },
  socialCallback: {
    title: '你已成功登录',
    description:
      '你已成功使用社交账户登录。为确保与 Logto 的无缝集成并获得所有功能的访问权限，我们建议你继续配置自己的社交连接器。',
  },
  tenant: {
    create_tenant: '创建租户',
  },
};

export default Object.freeze(cloud);
