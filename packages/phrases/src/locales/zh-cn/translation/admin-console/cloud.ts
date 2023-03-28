const cloud = {
  welcome: {
    page_title: '欢迎',
    title: '欢迎来到 Logto Cloud（预览版），让我们一起创建独属于你的体验',
    description:
      '无论你是开源用户还是云用户，都可以在展示中了解 Logto 的全部价值。Cloud 预览版也是 Logto Cloud 的初步版本。',
    project_field: '我使用 Logto 是为了',
    project_options: {
      personal: '个人项目',
      company: '公司项目',
    },
    deployment_type_field: '你偏爱开源还是云？',
    deployment_type_options: {
      open_source: '开源',
      cloud: '云',
    },
  },
  about: {
    page_title: '关于你',
    title: '关于你的一些信息',
    description: '通过更好地了解你，我们可以使你的 Logto 体验更加个性化。你的信息是安全的。',
    title_field: '你的头衔',
    title_options: {
      developer: '开发人员',
      team_lead: '团队负责人',
      ceo: 'CEO',
      cto: 'CTO',
      product: '产品',
      others: '其他',
    },
    company_name_field: '公司名称',
    company_name_placeholder: 'Acme.co',
    company_size_field: '你的公司规模如何？',
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: '我注册的原因是',
    reason_options: {
      passwordless: '寻找无需密码身份验证和 UI 工具包',
      efficiency: '寻找即插即用的身份基础架构',
      access_control: '基于角色和责任控制用户访问',
      multi_tenancy: '寻求面向多租户产品的策略',
      enterprise: '为产品更方便企业使用寻找 SSO 解决方案',
      others: '其他',
    },
  },
  congrats: {
    page_title: '获得早鸟惊喜',
    title: '好消息！你有资格获得 Logto Cloud 的早鸟惊喜。',
    description:
      '别错过：立即联系 Logto 团队，了解更多信息，获得 Logto Cloud 正式版 <strong>60 天</strong> 的免费试用机会！',
    check_out_button: '查看实时预览',
    reserve_title: '与 Logto 团队预定时间',
    reserve_description: '验证后仅有一次领取资格。',
    book_button: '现在预定',
    join_description: '加入我们的公开 <a>{{link}}</a>，与其他开发人员连接和聊天。',
    discord_link: 'Discord 频道',
    enter_admin_console: '进入 Logto Cloud 预览',
  },
  gift: {
    title: '免费使用 Logto Cloud 60 天，立即成为尝鲜会员！',
    description: '预定与我们团队的一对一会话，以获取早鸟惊喜。',
    reserve_title: '与 Logto 团队预定时间',
    reserve_description: '评估后仅有一次领取资格。',
    book_button: '预定',
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
  broadcast: '📣 你正在使用 Logto Cloud（预览版）',
  socialCallback: {
    title: '你已成功登录',
    description:
      '你已成功使用社交账户登录。为确保与 Logto 的无缝集成并获得所有功能的访问权限，我们建议你继续配置自己的社交连接器。',
  },
};

export default cloud;
