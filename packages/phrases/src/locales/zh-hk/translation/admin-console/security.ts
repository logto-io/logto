const security = {
  page_title: '安全性',
  title: '安全性',
  subtitle: '配置針對複雜攻擊的高級保護。',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: '密碼策略',
    blocklist: '封鎖清單',
    general: '一般',
  },
  bot_protection: {
    title: '機器人保護',
    description: '為註冊、登入和密碼重設啟用 CAPTCHA 以阻止自動化威脅。',
    captcha: {
      title: 'CAPTCHA',
      placeholder: '選擇一個 CAPTCHA 供應商並設定整合。',
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
    domain: '網域（可選）',
    domain_placeholder: 'www.google.com（預設）或 recaptcha.net',
    recaptcha_key_id: 'reCAPTCHA 金鑰 ID',
    recaptcha_api_key: '項目的 API 金鑰',
    deletion_description: '你確定要刪除此 CAPTCHA 供應商嗎？',
    captcha_deleted: 'CAPTCHA 供應商已成功刪除',
    setup_captcha: '設定 CAPTCHA',
    mode: '驗證模式',
    mode_invisible: '無感驗證',
    mode_checkbox: '複選框驗證',
    mode_notice:
      '驗證模式在 Google Cloud Console 的 reCAPTCHA 金鑰設定中定義。更改此處的模式需要匹配的金鑰類型。',
  },
  password_policy: {
    password_requirements: '密碼要求',
    password_requirements_description: '增強密碼要求以防禦憑證填充和弱密碼攻擊。',
    minimum_length: '最小長度',
    minimum_length_description: 'NIST 建議在 Web 產品中使用至少 8 個字符。',
    minimum_length_error: '最小長度必須介於{{min}}和{{max}}之間（包括{{min}}和{{max}}）。',
    minimum_required_char_types: '最小所需字符類型',
    minimum_required_char_types_description:
      '字符類型：大寫字母（A-Z）、小寫字母（a-z）、數字（0-9）和特殊符號（{{symbols}}）。',
    password_rejection: '密碼拒絕設置',
    compromised_passwords: '拒絕被破解的密碼',
    breached_passwords: '洩露的密碼',
    breached_passwords_description: '拒絕之前在洩露數據庫中出現的密碼。',
    restricted_phrases: '限制低安全性短語',
    restricted_phrases_tooltip: '密碼應該避免使用這些短語，除非結合至少 3 個或更多的額外字符。',
    repetitive_or_sequential_characters: '重複或連續字符',
    repetitive_or_sequential_characters_description: '例如："AAAA"、"1234"和"abcd"。',
    user_information: '用戶信息',
    user_information_description: '例如：郵件地址、電話號碼、用戶名等等。',
    custom_words: '自定義詞彙',
    custom_words_description: '個性化上下文特定的詞彙，不區分大小寫，每行一個詞。',
    custom_words_placeholder: '你的服務名稱、公司名稱等等。',
  },
  sentinel_policy: {
    card_title: '識別鎖定',
    card_description:
      '鎖定對於所有用戶可用，默認設置下即可使用，但你可以自定義以便獲得更多控制。\n\n在多次身份驗證失敗（例如：密碼錯誤或驗證碼錯誤）後，暫時鎖定一個識別符以防止暴力破解。',
    enable_sentinel_policy: {
      title: '自定義鎖定體驗',
      description: '允許自定義超過鎖定前的最多失敗登入嘗試次數、鎖定時長及立即手動解鎖。',
    },
    max_attempts: {
      title: '最大失敗嘗試次數',
      description: '在一小時內達到最大失敗登入嘗試次數後暫時鎖定一個識別符。',
      error_message: '最大失敗嘗試次數必須大於 0。',
    },
    lockout_duration: {
      title: '封鎖時長（分鐘）',
      description: '在超過最大失敗嘗試次數後，封鎖一段時間。',
      error_message: '封鎖時長必須至少為 1 分鐘。',
    },
    manual_unlock: {
      title: '手動解鎖',
      description: '通過確認用戶身份並輸入識別符立即解鎖用戶。',
      unblock_by_identifiers: '按照識別符解鎖',
      modal_description_1:
        '由於多次登入/註冊嘗試失敗而暫時鎖定了一個識別符。為了保護安全，訪問將在封鎖時長後自動恢復。',
      modal_description_2: ' 只有在確認用戶身份並確保沒有未授權的訪問嘗試後才進行手動解鎖。',
      placeholder: '輸入識別符（郵件地址/電話號碼/用戶名）',
      confirm_button_text: '立即解鎖',
      success_toast: '解鎖成功',
      duplicate_identifier_error: '識別符已添加',
      empty_identifier_error: '請輸入至少一個識別符',
    },
  },
  blocklist: {
    card_title: '電子郵件封鎖清單',
    card_description: '通過封鎖高風險或不需要的電子郵件地址來控制你的用戶群。',
    disposable_email: {
      title: '封鎖一次性電子郵件地址',
      description:
        '啟用後將拒絕使用一次性或臨時電子郵件地址的註冊嘗試，這可以防止垃圾信息並改善用戶質量。',
    },
    email_subaddressing: {
      title: '封鎖電子郵件子地址',
      description:
        '啟用以拒絕使用帶有加號（+）和其他字符（例如 user+alias@foo.com）的電子郵件子地址的註冊嘗試。',
    },
    custom_email_address: {
      title: '封鎖自定義電子郵件地址',
      description: '添加不能通過 UI 註冊或連結的特定電子郵件域或地址。',
      placeholder: '輸入被封鎖的電子郵件地址或域（例如 bar@example.com, @example.com）',
      duplicate_error: '電子郵件地址或域已添加',
      invalid_format_error: '必須是有效的電子郵件地址(bar@example.com)或域(@example.com)',
    },
  },
};

export default Object.freeze(security);
