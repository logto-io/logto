const security = {
  page_title: '安全',
  title: '安全',
  subtitle: '配置高级防护以抵御复杂攻击。',
  bot_protection: {
    title: '机器人防护',
    description: '为注册、登录和密码恢复启用 CAPTCHA，以阻止自动化威胁。',
    captcha: {
      title: 'CAPTCHA',
      placeholder: '选择 CAPTCHA 供应商并设置集成。',
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
        'Cloudflare 的智能 CAPTCHA 替代方案，在确保无视觉谜题的流畅用户体验的同时，提供非侵入性的机器人防护。',
    },
  },
  captcha_details: {
    back_to_security: '返回安全',
    page_title: 'CAPTCHA 详情',
    check_readme: '查看 README',
    options_change_captcha: '更换 CAPTCHA 供应商',
    connection: '连接',
    description: '配置你的 CAPTCHA 连接。',
    site_key: '站点密钥',
    secret_key: '私密密钥',
    project_id: '项目 ID',
    deletion_description: '你确定要删除此 CAPTCHA 供应商吗？',
    captcha_deleted: 'CAPTCHA 供应商已成功删除',
    setup_captcha: '设置 CAPTCHA',
  },
};

export default Object.freeze(security);
