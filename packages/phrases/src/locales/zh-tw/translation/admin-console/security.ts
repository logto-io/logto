const password_policy = {
  password_requirements: '密碼需求',
  minimum_length: '最小長度',
  minimum_length_description:
    '美國國家標準與技術研究所 (NIST) 建議網路產品需至少使用 <a>8 個字元</a>。',
  minimum_length_error: '最小長度必須介於 {{min}} 到 {{max}}（包括）之間。',
  minimum_required_char_types: '最低需要的字元類型',
  minimum_required_char_types_description:
    '字元類型：大寫字母（A-Z）、小寫字母（a-z）、數字（0-9）和特殊符號（{{symbols}}）。',
  password_rejection: '拒絕密碼',
  compromised_passwords: '拒絕已破解的密碼',
  breached_passwords: '遭破解的密碼',
  breached_passwords_description: '拒絕之前在密碼洩漏資料庫中找到的密碼。',
  restricted_phrases: '限制低安全性片語',
  restricted_phrases_tooltip: '除非您結合 3 個或更多的額外字元，否則密碼應避免使用這些片語。',
  repetitive_or_sequential_characters: '重複或連續字元',
  repetitive_or_sequential_characters_description: '例如：“AAAA”，“1234”，和“abcd”。',
  user_information: '用戶資訊',
  user_information_description: '例如，電子郵件地址，電話號碼，用戶名等。',
  custom_words: '自訂字詞',
  custom_words_description: '個性化上下文相關的字詞，不區分大小寫，每行一個。',
  custom_words_placeholder: '您的服務名稱，公司名稱等。',
};

const security = {
  page_title: '安全',
  title: '安全',
  subtitle: '配置進階保護以抵禦複雜攻擊。',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: '密碼政策',
  },
  bot_protection: {
    title: '機器人保護',
    description: '為註冊、登入和密碼重設啟用 CAPTCHA 以阻擋自動化威脅。',
    captcha: {
      title: 'CAPTCHA',
      placeholder: '選擇一個 CAPTCHA 提供商並設定整合。',
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
    deletion_description: '你確定要刪除此 CAPTCHA 提供商嗎？',
    captcha_deleted: 'CAPTCHA 提供商刪除成功',
    setup_captcha: '設定 CAPTCHA',
  },
  password_policy,
};

export default Object.freeze(security);
