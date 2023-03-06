const sign_in_exp = {
  title: '登录体验',
  description: '自定义登录界面，并实时预览真实效果',
  tabs: {
    branding: '品牌',
    sign_up_and_sign_in: '注册与登录',
    others: '其它',
  },
  welcome: {
    title: 'Customize sign-in experience', // UNTRANSLATED
    description:
      'Get started fast with your first sign-in setup. This guide walks you through all the necessary settings.', // UNTRANSLATED
    get_started: '开始',
    apply_remind: '请注意，登录体验将会应用到当前帐户下的所有应用。',
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
    favicon: '浏览器地址栏图标',
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
    identifiers_email: '邮件地址',
    identifiers_phone: '手机号码',
    identifiers_username: '用户名',
    identifiers_email_or_sms: '邮件地址或手机号码',
    identifiers_none: '无',
    and: '与',
    or: '或',
    sign_up: {
      title: '注册',
      sign_up_identifier: '注册标识',
      identifier_description: '创建账户时你需要设定注册标识。这些信息在用户登录时，属于必选项。',
      sign_up_authentication: '注册身份认证设置',
      authentication_description: '注册时，你的用户将要完成以下所有勾选的任务。',
      set_a_password_option: '创建密码',
      verify_at_sign_up_option: '注册时验证身份',
      social_only_creation_description: '（仅对社交注册用户适用）',
    },
    sign_in: {
      title: '登录',
      sign_in_identifier_and_auth: '登录标识和身份认证设置',
      description: '用户可以使用任何可用的选项进行登录。拖拽选项即可调整页面布局。',
      add_sign_in_method: '添加登录方式',
      password_auth: '密码',
      verification_code_auth: '验证码',
      auth_swap_tip: '交换以下选项的位置即可设定它们在用户登录流程中出现的先后。',
      require_auth_factor: '请至少选择一种认证方式。',
    },
    social_sign_in: {
      title: '社交登录',
      social_sign_in: '社交登录',
      description: '你已设定特定的标识。用户在通过社交连接器注册时可能会被要求提供一个对应的标识。',
      add_social_connector: '添加社交连接器',
      set_up_hint: {
        not_in_list: '没有你想要的连接器？',
        set_up_more: '立即设置',
        go_to: '其他社交连接器。',
      },
    },
    tip: {
      set_a_password: '启用户名注册，必须设置密码。',
      verify_at_sign_up:
        '我们目前仅支持经过验证的邮件地址登录。如果没有验证，你的用户信息中可能出现大量无效电子邮件地址。',
      password_auth: '因注册设置里你启用了用户名密码标识。这个信息在用户登录时，属于必选项。',
      verification_code_auth:
        '因注册设置里你启用了验证码标识，验证码属于用户必选项。开启密码注册后，你可以选择关闭验证码登录。',
      delete_sign_in_method:
        '因注册设置里你启用了{{identifier}}标识。这些信息在用户登录时，属于必选项。',
    },
  },
  others: {
    terms_of_use: {
      title: '使用条款',
      terms_of_use: '使用条款',
      terms_of_use_placeholder: 'https://your.terms.of.use/',
      terms_of_use_tip: '使用条款 URL',
    },
    languages: {
      title: '语言',
      enable_auto_detect: '开启语言自动适配',
      description:
        '基于用户自身的语言设定，产品将展示最符合用户使用习惯的语言。你可以为产品添加翻译内容、选择语言代码和设定自定义语言，来延展产品的本地化需求。',
      manage_language: '管理语言',
      default_language: '默认语言',
      default_language_description_auto:
        '语言自动适配已开启，当用户设定的语言无法匹配时，他们将看到默认语言。',
      default_language_description_fixed:
        '语言自动适配已关闭，你的应用将只展示默认语言。开启自动适配即可定制语言。',
    },
    manage_language: {
      title: '管理语言',
      subtitle: '你可以为产品添加翻译内容、选择语言代码和设定自定义语言，来延展产品的本地化需求。',
      add_language: '添加语言',
      logto_provided: 'Logto 提供',
      key: '键名',
      logto_source_values: 'Logto 源语言',
      custom_values: '翻译文本',
      clear_all_tip: '清空',
      unsaved_description: '离开页面前，记得保存你本次做的内容修改。',
      deletion_tip: '删除',
      deletion_title: '你确定你要删除新加的语言吗？',
      deletion_description: '删除后，你的用户将无法使用该语言查看内容。',
      default_language_deletion_title: '你无法删除默认语言',
      default_language_deletion_description:
        '你已设置{{language}}为你的默认语言，你无法删除默认语言。',
    },
    advanced_options: {
      title: '高级选项',
      enable_user_registration: '启用用户注册',
      enable_user_registration_description:
        '开启或关闭用户注册功能。一旦关闭，用户将无法通过登录界面自行注册账号，但管理员仍可通过管理控制台添加用户。',
    },
  },
  setup_warning: {
    no_connector_sms:
      '你尚未设置 SMS 短信连接器。在完成该配置前，你将无法登录。<a>{{link}}</a>连接器。',
    no_connector_email:
      '你尚未设置电子邮件连接器。在完成该配置前，你将无法登录。<a>{{link}}</a>连接器。',
    no_connector_social:
      '你尚未设置社交连接器。在完成该配置前，你将无法登录。<a>{{link}}</a>连接器。',
    no_added_social_connector: '你已经成功设置了一些社交连接器。点按「+」添加一些到你的登录体验。',
    setup_link: '立即设置',
  },
  save_alert: {
    description:
      '你正在进行登录注册设置的变更。当前你的所有用户会受到新设置的影响。确认保存该设置吗？',
    before: '设置前',
    after: '设置后',
    sign_up: '注册',
    sign_in: '登录',
    social: '社交',
  },
  preview: {
    title: '登录预览',
    live_preview: 'Live preview', // UNTRANSLATED
    live_preview_tip: 'Save to preview changes', // UNTRANSLATED
    native: '移动原生',
    desktop_web: '桌面网页',
    mobile_web: '移动网页',
  },
};

export default sign_in_exp;
