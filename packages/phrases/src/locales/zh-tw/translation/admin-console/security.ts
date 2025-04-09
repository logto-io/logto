const security = {
  page_title: '安全',
  title: '安全',
  subtitle: '配置進階保護以抵禦複雜攻擊。',
  bot_protection: {
    title: '機器人保護',
    description: '為註冊、登入和密碼重設啟用 CAPTCHA 以阻擋自動化威脅。',
    captcha: {
      title: 'CAPTCHA',
      placeholder: '選擇一個 CAPTCHA 提供商並設定整合。',
      add: '新增 CAPTCHA',
    },
    settings: '設定',
    enable_captcha: '啟用 CAPTCHA',
    enable_captcha_description: '啟用註冊、登入和密碼恢復流程的 CAPTCHA 驗證。',
  },
  create_captcha: {
    setup_captcha: '設定 CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'Google 的企業級 CAPTCHA 解決方案，提供進階威脅偵測和詳細的安全分析，以保護你的網站免受詐騙活動的侵害。',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'Cloudflare 的智慧型 CAPTCHA 替代方案，提供非侵入性的機器人保護，同時確保不需要視覺拼圖的無縫使用者體驗。',
    },
  },
  captcha_details: {
    back_to_security: '返回安全',
    page_title: 'CAPTCHA 詳情',
    check_readme: '查看 README',
    options_change_captcha: '變更 CAPTCHA 提供商',
    connection: '連線',
    description: '設定你的 captcha 連線。',
    site_key: '站台金鑰',
    secret_key: '秘密金鑰',
    project_id: '專案 ID',
    recaptcha_key_id: 'reCAPTCHA 金鑰 ID',
    recaptcha_api_key: '專案的 API 金鑰',
    deletion_description: '你確定要刪除此 CAPTCHA 提供商嗎？',
    captcha_deleted: 'CAPTCHA 提供商刪除成功',
    setup_captcha: '設定 CAPTCHA',
  },
};

export default Object.freeze(security);
