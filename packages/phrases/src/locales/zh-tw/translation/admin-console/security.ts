const security = {
  page_title: '安全',
  title: '安全',
  subtitle: '配置進階保護以抵禦複雜攻擊。',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: '密碼政策',
    blocklist: '封鎖名單',
    general: '一般',
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
    domain: '網域（可選）',
    domain_placeholder: 'www.google.com（預設）或 recaptcha.net',
    recaptcha_key_id: 'reCAPTCHA 金鑰 ID',
    recaptcha_api_key: '專案的 API 金鑰',
    deletion_description: '你確定要刪除此 CAPTCHA 提供商嗎？',
    captcha_deleted: 'CAPTCHA 提供商刪除成功',
    setup_captcha: '設定 CAPTCHA',
    mode: '驗證模式',
    mode_invisible: '無感驗證',
    mode_checkbox: '複選框驗證',
    mode_notice:
      '驗證模式在 Google Cloud Console 的 reCAPTCHA 金鑰設定中定義。更改此處的模式需要匹配的金鑰類型。',
  },
  password_policy: {
    password_requirements: '密碼需求',
    password_requirements_description: '加強密碼需求以防範憑證填充及弱密碼攻擊。',
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
    restricted_phrases_tooltip: '除非你結合 3 個或更多的額外字元，否則密碼應避免使用這些片語。',
    repetitive_or_sequential_characters: '重複或連續字元',
    repetitive_or_sequential_characters_description: '例如：“AAAA”，“1234”，和“abcd”。',
    user_information: '用戶資訊',
    user_information_description: '例如，電子郵件地址，電話號碼，用戶名等。',
    custom_words: '自訂字詞',
    custom_words_description: '個性化上下文相關的字詞，不區分大小寫，每行一個。',
    custom_words_placeholder: '你的服務名稱，公司名稱等。',
  },
  sentinel_policy: {
    card_title: '識別符鎖定',
    card_description:
      '鎖定對所有用戶都可用並帶有預設設置，但你可以自訂以獲得更多控制。\n\n在多次認證失敗（例如，連續密碼或驗證碼錯誤）後暫時鎖定識別符，以防止暴力破解。',
    enable_sentinel_policy: {
      title: '自訂鎖定體驗',
      description: '允許自訂在鎖定之前的最大失敗登入嘗試次數、鎖定持續時間和立即手動解鎖。',
    },
    max_attempts: {
      title: '最大失敗嘗試次數',
      description: '在一小時內達到最大失敗登入嘗試次數後，暫時鎖定識別符。',
      error_message: '最大失敗嘗試次數必須大於 0。',
    },
    lockout_duration: {
      title: '鎖定持續時間（分鐘）',
      description: '在超過最大失敗嘗試次數限制後，封鎖登入一段時間。',
      error_message: '鎖定持續時間必須至少 1 分鐘。',
    },
    manual_unlock: {
      title: '手動解鎖',
      description: '通過確認用戶身份並輸入其識別符立即解鎖用戶。',
      unblock_by_identifiers: '按識別符解鎖',
      modal_description_1:
        '由於多次嘗試登入/註冊失敗，一個識別符被暫時鎖定。為了保護安全，訪問將在鎖定持續時間後自動恢復。',
      modal_description_2: ' 只有在你確認用戶身份並確保沒有未經授權的訪問嘗試後，才手動解鎖。',
      placeholder: '輸入識別符（電子郵件地址 / 電話號碼 / 用戶名）',
      confirm_button_text: '立即解鎖',
      success_toast: '解鎖成功',
      duplicate_identifier_error: '識別符已添加',
      empty_identifier_error: '請輸入至少一個識別符',
    },
  },
  blocklist: {
    card_title: '電子郵件封鎖名單',
    card_description: '通過封鎖高風險或不需要的電子郵件地址來控管你的用戶群。',
    disposable_email: {
      title: '封鎖一次性電子郵件地址',
      description:
        '啟用以拒絕使用一次性或臨時電子郵件地址的註冊嘗試，這樣可以防止垃圾郵件並提高用戶質量。',
    },
    email_subaddressing: {
      title: '封鎖電子郵件子地址',
      description:
        '啟用以拒絕任何使用加號 (+) 和額外字元（例如，user+alias@foo.com）的電子郵件子地址進行註冊嘗試。',
    },
    custom_email_address: {
      title: '封鎖自訂電子郵件地址',
      description: '添加無法註冊或通過 UI 連結的特定電子郵件域或電子郵件地址。',
      placeholder: '輸入被封鎖的電子郵件地址或域（例如，bar@example.com, @example.com）',
      duplicate_error: '電子郵件地址或域已添加',
      invalid_format_error: '必須是有效的電子郵件地址(bar@example.com)或域(@example.com)',
    },
  },
};

export default Object.freeze(security);
