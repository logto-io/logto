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
    /** UNTRANSLATED */
    stage_field: 'What stage is your product currently in?',
    stage_options: {
      /** UNTRANSLATED */
      new_product: 'Start a new project and looking for a quick, out-of-the-box solution',
      /** UNTRANSLATED */
      existing_product:
        'Migrate from current authentication (e.g., self-built, Auth0, Cognito, Microsoft)',
      /** UNTRANSLATED */
      target_enterprise_ready:
        'I just landed bigger clients and now make my product ready to sell to enterprises',
    },
    /** UNTRANSLATED */
    additional_features_field: 'Do you have anything else you want us to know?',
    additional_features_options: {
      /** UNTRANSLATED */
      customize_ui_and_flow:
        'Need the ability to bring my own UI, or customize my own flows via Logto API',
      /** UNTRANSLATED */
      compliance: 'SOC2 and GDPR are must-haves',
      /** UNTRANSLATED */
      export_user_data: 'Need the ability to export user data from Logto',
      /** UNTRANSLATED */
      budget_control: 'I have very tight budget control',
      /** UNTRANSLATED */
      bring_own_auth: 'Have my own auth services and just need some Logto features',
      /** UNTRANSLATED */
      others: 'None of these above',
    },
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
        '请勿将演示连接器用于生产目的。完成测试后，请删除演示连接器并使用你的凭据设置自己的连接器。',
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
