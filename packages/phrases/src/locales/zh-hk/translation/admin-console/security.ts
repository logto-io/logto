const security = {
  page_title: '安全性',
  title: '安全性',
  subtitle: '配置針對複雜攻擊的高級保護。',
  bot_protection: {
    title: '機器人保護',
    description: '為註冊、登入和密碼重設啟用 CAPTCHA 以阻止自動化威脅。',
    captcha: {
      title: 'CAPTCHA',
      placeholder: '選擇一個 CAPTCHA 供應商並設定整合。',
      add: '新增 CAPTCHA',
    },
    settings: '設定',
    captcha_required_flows: '需要 CAPTCHA 的流程',
    sign_up: '註冊',
    sign_in: '登入',
    forgot_password: '忘記密碼',
  },
  create_captcha: {
    setup_captcha: '設定 CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'Google 的企業級 CAPTCHA 解決方案，提供先進的威脅偵測和詳細的安全分析，以保護你的網站免受詐騙活動的侵害。',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'Cloudflare 的智能 CAPTCHA 替代方案，提供非侵入性的機器人保護，同時確保無視覺難題的無縫用戶體驗。',
    },
  },
  captcha_details: {
    back_to_security: '返回安全性',
    page_title: 'CAPTCHA 詳情',
    check_readme: '查看 README',
    options_change_captcha: '更改 CAPTCHA 供應商',
    connection: '連接',
    description: '配置你的 CAPTCHA 連接。',
    site_key: '站點金鑰',
    secret_key: '私密金鑰',
    project_id: '項目 ID',
    deletion_description: '你確定要刪除此 CAPTCHA 供應商嗎？',
    captcha_deleted: 'CAPTCHA 供應商已成功刪除',
    setup_captcha: '設定 CAPTCHA',
  },
};

export default Object.freeze(security);
