const security = {
  page_title: '安全',
  title: '安全',
  subtitle: '配置高级保护以防御复杂攻击。',
  bot_protection: {
    title: '机器人保护',
    description: '为注册、登录和密码恢复启用 CAPTCHA 以阻止自动化威胁。',
    captcha: {
      title: 'CAPTCHA',
      placeholder: '选择一个 CAPTCHA 提供商并设置集成。',
      add: '添加 CAPTCHA',
    },
    settings: '设置',
    captcha_required_flows: '需要 CAPTCHA 的流程',
    sign_up: '注册',
    sign_in: '登录',
    forgot_password: '忘记密码',
  },
  create_captcha: {
    setup_captcha: '设置 CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'Google 的企业级 CAPTCHA 解决方案，提供高级威胁检测和详细的安全分析，以保护你的网站免受欺诈活动的侵害。',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'Cloudflare 的智能 CAPTCHA 替代方案，提供非侵入性的机器人保护，同时确保不需要视觉拼图的无缝用户体验。',
    },
  },
  captcha_details: {
    back_to_security: '返回安全',
    page_title: 'CAPTCHA 详情',
    check_readme: '查看 README',
    options_change_captcha: '更改 CAPTCHA 提供商',
    connection: '连接',
    description: '配置你的 captcha 连接。',
    site_key: '站点密钥',
    secret_key: '秘密密钥',
    project_id: '项目 ID',
    deletion_description: '你确定要删除此 CAPTCHA 提供商吗？',
    captcha_deleted: 'CAPTCHA 提供商删除成功',
    setup_captcha: '设置 CAPTCHA',
  },
};

export default Object.freeze(security);
