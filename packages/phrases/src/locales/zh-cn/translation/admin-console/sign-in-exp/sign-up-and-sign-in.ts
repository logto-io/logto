const sign_up_and_sign_in = {
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
    identifier_description: '创建新账户时，所有选定的注册标识都是必需的。',
    sign_up_authentication: '注册身份认证设置',
    verification_tip: '用户必须在注册时通过输入验证码，验证你已配置的邮箱或手机号。',
    authentication_description: '注册时，你的用户将要完成以下所有勾选的任务。',
    set_a_password_option: '创建密码',
    verify_at_sign_up_option: '注册时验证身份',
    social_only_creation_description: '（仅对社交注册用户适用）',
  },
  sign_in: {
    title: '登录',
    sign_in_identifier_and_auth: '登录标识和身份认证设置',
    description: '用户可以使用任何可用的选项进行登录。',
    add_sign_in_method: '添加登录方式',
    add_sign_up_method: '添加注册方式',
    password_auth: '密码',
    verification_code_auth: '验证码',
    auth_swap_tip: '交换以下选项的位置即可设定它们在用户登录流程中出现的先后。',
    require_auth_factor: '请至少选择一种认证方式。',
    forgot_password_verification_method: '忘记密码验证方式',
    forgot_password_description: '用户可以使用任何可用的验证方式重置密码。',
    add_verification_method: '添加验证方式',
    email_verification_code: '邮箱验证码',
    phone_verification_code: '手机验证码',
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
    automatic_account_linking: '自动账号关联',
    automatic_account_linking_label:
      '开启后，如果用户使用系统中新社交身份登录，且系统中存在同一标识（如邮件地址）的唯一账号，Logto 会自动将该账号与社交身份关联，而不是提示用户进行账号关联。',
  },
  tip: {
    set_a_password: '启用户名注册，必须设置密码。',
    verify_at_sign_up:
      '我们目前仅支持经过验证的邮件地址登录。如果没有验证，你的用户信息中可能出现大量无效电子邮件地址。',
    password_auth: '因注册设置里你启用了用户名密码标识。这个信息在用户登录时，属于必选项。',
    verification_code_auth:
      '因注册设置里你启用了验证码标识，验证码属于用户必选项。开启密码注册后，你可以选择关闭验证码登录。',
    email_mfa_enabled:
      '电子邮件验证码已启用为多因素身份验证，所以不能重复用于主要登录方式以确保安全。',
    phone_mfa_enabled: '手机验证码已启用为多因素身份验证，所以不能重复用于主要登录方式以确保安全。',
    delete_sign_in_method:
      '因注册设置里你启用了{{identifier}}标识。这些信息在用户登录时，属于必选项。',
    password_disabled_notification:
      '用户名注册时，"创建密码" 选项已禁用，这可能会阻止用户登录。确认后继续保存。',
  },
  advanced_options: {
    title: '高级选项',
    enable_single_sign_on: '启用企业单点登录（SSO）',
    enable_single_sign_on_description: '启用用户使用他们的企业身份进行单点登录到应用程序。',
    single_sign_on_hint: {
      prefix: '前往',
      link: '"企业 SSO"',
      suffix: '部分以设置更多企业连接器。',
    },
    enable_user_registration: '启用用户注册',
    enable_user_registration_description:
      '启用或禁用用户注册。禁用后，管理员仍然可以添加用户，但用户无法通过登录界面建立账户。',
    unknown_session_redirect_url: '未知会话重定向 URL',
    unknown_session_redirect_url_tip:
      '有时，Logto 可能无法识别用户在登录页面的会话，例如会话过期，或用户收藏或分享了登录链接。默认情况下，会出现“未知会话” 404 错误。为提升用户体验，请设置一个备用 URL ，将用户重定向回你的应用程序并重新开始身份验证。',
  },
};

export default Object.freeze(sign_up_and_sign_in);
