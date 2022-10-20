const sign_in_exp = {
  title: '登录体验',
  description: '自定义登录界面，并实时预览真实效果',
  tabs: {
    branding: '品牌',
    sign_up_and_sign_in: 'Sign up and Sign in', // UNTRANSLATED
    others: '其它',
  },
  welcome: {
    title: '这是你首次定义登录体验。跟随引导，完成登录体验的必要设置项。',
    get_started: '开始',
    apply_remind: '请注意，登录体验将会应用到当前帐户下的所有应用。',
    got_it: '知道了',
  },
  color: {
    title: '颜色',
    primary_color: '品牌颜色',
    dark_primary_color: '品牌颜色 (深色)',
    dark_mode: '开启深色模式',
    dark_mode_description:
      '基于品牌颜色和 Logto 的算法，应用将会有一个自动生成的深色模式。当然，你可以自定义和修改。',
    dark_mode_reset_tip: '基于品牌颜色，重新生成深色模式颜色。',
    reset: '重新生成',
  },
  branding: {
    title: '品牌定制区',
    ui_style: '样式',
    styles: {
      logo_slogan: 'Logo 和标语',
      logo: '仅有 Logo',
    },
    logo_image_url: 'Logo 图片 URL',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'Logo 图片 URL (深色)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    slogan: '标语',
    slogan_placeholder: '释放你的创意',
  },
  sign_up_and_sign_in: {
    identifiers: 'Sign up identifiers', // UNTRANSLATED
    identifiers_email: 'Email address', // UNTRANSLATED
    identifiers_phone: 'Phone number', // UNTRANSLATED
    identifiers_username: 'Username', // UNTRANSLATED
    identifiers_email_or_phone: 'Email address or phone number', // UNTRANSLATED
    identifiers_none: 'None', // UNTRANSLATED
    sign_up: {
      title: 'SIGN UP', // UNTRANSLATED
      sign_up_identifier: 'Sign up identifier', // UNTRANSLATED
      sign_up_authentication: 'Sign up authentication', // UNTRANSLATED
      set_a_password_option: 'Set a password', // UNTRANSLATED
      verify_at_sign_up_option: 'Verify at sign up', // UNTRANSLATED
      social_only_creation_description: '(This apply to social only account creation)', // UNTRANSLATED
    },
  },
  sign_in_methods: {
    title: '登录方式',
    primary: '主要登录方式',
    enable_secondary: '启用其它登录方式',
    enable_secondary_description: '开启后，除了主要登录方式，你的 app 将会支持更多其它的登录方式 ',
    methods: '登录方式',
    methods_sms: '手机号登录',
    methods_email: '邮箱登录',
    methods_social: '社交帐号登录',
    methods_username: '用户名密码登录',
    methods_primary_tag: '（主要）',
    define_social_methods: '定义社交登录方式',
    transfer: {
      title: '社交连接器',
      footer: {
        not_in_list: '不在列表里？',
        set_up_more: '设置更多',
        go_to: '社交连接器，或前往连接器模块进行设置。',
      },
    },
  },
  others: {
    terms_of_use: {
      title: '使用条款',
      enable: '开启使用条款',
      description: '添加使用产品的法律协议。',
      terms_of_use: '使用条款',
      terms_of_use_placeholder: 'https://your.terms.of.use/',
      terms_of_use_tip: '使用条款 URL',
    },
    languages: {
      title: '语言',
      mode: '语言模式',
      auto: '自动',
      fixed: '固定',
      fallback_language: '备用语言',
      fallback_language_tip: '如果 Logto 找不到合适的语言包，将回退至哪种语言。',
      fixed_language: '固定语言',
    },
    authentication: {
      title: '身份验证',
      enable_create_account: '启用创建帐号',
      enable_create_account_description:
        '启用或禁用创建帐号（注册）。一旦禁用，你的用户将无法通过登录 UI 来创建帐户，但你仍可以通过「管理面板」添加用户。',
    },
  },
  setup_warning: {
    no_connector: '',
    no_connector_phone: '你还没有设置 SMS 连接器。你需完成设置后登录体验才会生效。',
    no_connector_email: '你还没有设置 email 连接器。你需完成设置后登录体验才会生效。',
    no_connector_email_or_phone:
      '你还没有设置 email 和 SMS 连接器。你需完成设置后登录体验才会生效。',
    no_connector_none: '你还没有设置社交连接器。你需完成设置后登录体验才会生效。',
    no_added_social_connector: '你已经成功设置了一些社交连接器。点按「+」添加一些到你的登录体验。',
  },
  save_alert: {
    description: '你正在修改登录方式，这可能会影响部分用户。是否继续保存修改？',
    before: '修改前',
    after: '修改后',
  },
  preview: {
    title: '登录预览',
    dark: '深色',
    light: '浅色',
    native: '移动原生',
    desktop_web: '桌面网页',
    mobile_web: '移动网页',
  },
};

export default sign_in_exp;
