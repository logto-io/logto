const security = {
  page_title: '安全',
  title: '安全',
  subtitle: '配置高级保护以防御复杂攻击。',
  tabs: {
    captcha: '验证码',
    password_policy: '密码策略',
    blocklist: '阻止列表',
    general: '常规',
  },
  bot_protection: {
    title: '机器人保护',
    description: '启用验证码以阻止注册、登录和密码恢复中的自动化威胁。',
    captcha: {
      title: '验证码',
      placeholder: '选择一个验证码提供商并设置集成。',
      add: '添加验证码',
    },
    settings: '设置',
    enable_captcha: '启用验证码',
    enable_captcha_description: '为注册、登录和密码恢复流程启用验证码验证。',
  },
  create_captcha: {
    setup_captcha: '设置验证码',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        '谷歌的企业级验证码解决方案，提供先进的威胁检测和详细的安全分析，以保护你的网站免受欺诈活动的侵害。',
    },
    turnstile: {
      name: 'Cloudflare 验证',
      description:
        'Cloudflare 的智能验证码替代方案，提供非侵入性的机器人保护，同时确保无视觉难题的无缝用户体验。',
    },
  },
  captcha_details: {
    back_to_security: '返回安全',
    page_title: '验证码详情',
    check_readme: '查看 README',
    options_change_captcha: '更改验证码提供商',
    connection: '连接',
    description: '配置你的验证码连接。',
    site_key: '站点密钥',
    secret_key: '秘密密钥',
    project_id: '项目 ID',
    domain: '域名（可选）',
    domain_placeholder: 'www.google.com（默认）或 recaptcha.net',
    recaptcha_key_id: 'reCAPTCHA 密钥 ID',
    recaptcha_api_key: '项目的 API 密钥',
    deletion_description: '你确定要删除此验证码提供商吗？',
    captcha_deleted: '验证码提供商删除成功',
    setup_captcha: '设置验证码',
    mode: '验证模式',
    mode_invisible: '无感验证',
    mode_checkbox: '复选框验证',
    mode_notice:
      '验证模式在 Google Cloud Console 的 reCAPTCHA 密钥设置中定义。更改此处的模式需要匹配的密钥类型。',
  },
  password_policy: {
    password_requirements: '密码要求',
    password_requirements_description: '增强密码要求以防止凭证填充和弱密码攻击。',
    minimum_length: '最小长度',
    minimum_length_description: 'NIST 建议在 Web 产品中使用至少 8 个字符。',
    minimum_length_error: '最小长度必须在 {{min}} 和 {{max}} 之间（包括 {{min}} 和 {{max}}）。',
    minimum_required_char_types: '最小要求字符类型',
    minimum_required_char_types_description:
      '字符类型：大写字母（A-Z），小写字母（a-z），数字（0-9）以及特殊字符（{{symbols}}）。',
    password_rejection: '密码拒绝',
    compromised_passwords: '拒绝已泄露的密码',
    breached_passwords: '泄露的密码',
    breached_passwords_description: '拒绝之前在泄露数据库中发现的密码。',
    restricted_phrases: '限制低安全性短语',
    restricted_phrases_tooltip: '密码应避免使用这些短语，除非结合 3 个或更多额外字符。',
    repetitive_or_sequential_characters: '重复或连续字符',
    repetitive_or_sequential_characters_description: '例如，“AAAA”、“1234”和“abcd”。',
    user_information: '用户信息',
    user_information_description: '例如，电子邮件地址，电话号码，用户名等。',
    custom_words: '自定义词汇',
    custom_words_description: '个性化上下文相关的词汇，不区分大小写，每行一个。',
    custom_words_placeholder: '您的服务名称，公司名称等。',
  },
  sentinel_policy: {
    card_title: '标识符锁定',
    card_description:
      '锁定对所有用户默认可用，但你可以自定义以获得更多控制权。\n\n在多次身份验证失败（例如，连续密码错误或验证码错误）后临时锁定标识符，以防止暴力破解访问。',
    enable_sentinel_policy: {
      title: '自定义锁定体验',
      description: '允许自定义锁定前的最大失败登录尝试次数、锁定持续时间及立即手动解锁。',
    },
    max_attempts: {
      title: '最大失败尝试次数',
      description: '在达到一小时内最大失败登录尝试次数后，暂时锁定标识符。',
      error_message: '最大失败尝试次数必须大于 0。',
    },
    lockout_duration: {
      title: '锁定时长（分钟）',
      description: '在超过最大失败尝试次数限制后，阻止登录一段时间。',
      error_message: '锁定时长必须至少为 1 分钟。',
    },
    manual_unlock: {
      title: '手动解锁',
      description: '通过确认用户身份并输入其标识符立即解锁用户。',
      unblock_by_identifiers: '通过标识符解锁',
      modal_description_1:
        '由于多次登录/注册失败，标识符已被暂时锁定。为保证安全，访问将在锁定时长后自动恢复。',
      modal_description_2: ' 仅在确认用户身份并确保无未经授权的访问尝试后手动解锁。',
      placeholder: '输入标识符（电子邮件地址 / 电话号码 / 用户名）',
      confirm_button_text: '立即解锁',
      success_toast: '解锁成功',
      duplicate_identifier_error: '标识符已添加',
      empty_identifier_error: '请输入至少一个标识符',
    },
  },
  blocklist: {
    card_title: '电子邮件阻止列表',
    card_description: '通过阻止高风险或不受欢迎的电子邮件地址来控制用户群。',
    disposable_email: {
      title: '阻止一次性电子邮件地址',
      description:
        '启用此功能以拒绝使用一次性或临时电子邮件地址的注册尝试，这可以防止垃圾邮件并提高用户质量。',
    },
    email_subaddressing: {
      title: '阻止电子邮件子地址',
      description:
        '启用以拒绝使用加号（+）和附加字符（例如，user+alias@foo.com）的电子邮件子地址进行的注册尝试。',
    },
    custom_email_address: {
      title: '阻止自定义电子邮件地址',
      description: '添加特定电子邮件域或电子邮件地址，无法通过 UI 注册或链接。',
      placeholder: '输入被阻止的电子邮件地址或域名（例如，bar@example.com，@example.com）',
      duplicate_error: '电子邮件地址或域名已添加',
      invalid_format_error: '必须是有效的电子邮件地址（bar@example.com）或域（@example.com）',
    },
  },
};

export default Object.freeze(security);
