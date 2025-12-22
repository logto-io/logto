const account_center = {
  header: {
    title: '账户中心',
  },
  home: {
    title: '页面未找到',
    description: '此页面不可用。',
  },
  verification: {
    title: '安全验证',
    description: '为保护账户安全，请确认是您本人。请选择验证身份的方法。',
    error_send_failed: '验证码发送失败，请稍后再试。',
    error_invalid_code: '验证码无效或已过期。',
    error_verify_failed: '验证失败，请重新输入验证码。',
    verification_required: '验证已失效，请重新验证身份。',
    try_another_method: '尝试其他验证方式',
  },
  password_verification: {
    title: '验证密码',
    description: '为保护账户安全，请输入您的密码完成验证。',
    error_failed: '验证失败，请检查您的密码。',
  },
  verification_method: {
    password: {
      name: '密码',
      description: '验证您的密码',
    },
    email: {
      name: '邮箱验证码',
      description: '发送验证码到您的邮箱',
    },
    phone: {
      name: '手机验证码',
      description: '发送验证码到您的手机号码',
    },
  },
  email: {
    title: '关联邮箱',
    description: '关联邮箱以用于登录或帮助找回账号。',
    verification_title: '输入邮箱验证码',
    verification_description: '验证码已发送到你的邮箱 {{email_address}}。',
    success: '已成功关联主要邮箱。',
    verification_required: '验证已失效，请重新验证身份。',
  },
  phone: {
    title: '关联手机号',
    description: '关联手机号用于登录或帮助找回账号。',
    verification_title: '输入短信验证码',
    verification_description: '验证码已发送到你的手机 {{phone_number}}。',
    success: '已成功关联主要手机号。',
    verification_required: '验证已失效，请重新验证身份。',
  },
  username: {
    title: '设置用户名',
    description: '用户名只能包含字母、数字和下划线。',
    success: '用户名更新成功。',
  },
  password: {
    title: '设置密码',
    description: '创建新密码以保护你的账号安全。',
    success: '密码更新成功。',
  },

  code_verification: {
    send: '发送验证码',
    resend: '还没有收到？<a>重新发送验证码</a>',
    resend_countdown: '还没有收到？<span>{{seconds}} 秒后可重新发送</span>',
  },

  email_verification: {
    title: '验证您的邮箱',
    prepare_description: '为保护账户安全，请确认是您本人。发送验证码到您的邮箱。',
    email_label: '邮箱地址',
    send: '发送验证码',
    description: '验证码已发送至您的邮箱 {{email}}。请输入验证码以继续。',
    resend: '还没有收到？<a>重新发送验证码</a>',
    resend_countdown: '还没有收到？<span>{{seconds}} 秒后可重新发送</span>',
    error_send_failed: '验证码发送失败，请稍后再试。',
    error_verify_failed: '验证失败，请重新输入验证码。',
    error_invalid_code: '验证码无效或已过期。',
  },
  phone_verification: {
    title: '验证您的手机',
    prepare_description: '为保护账户安全，请确认是您本人。发送验证码到您的手机。',
    phone_label: '手机号码',
    send: '发送验证码',
    description: '验证码已发送至您的手机 {{phone}}。请输入验证码以继续。',
    resend: '还没有收到？<a>重新发送验证码</a>',
    resend_countdown: '还没有收到？<span>{{seconds}} 秒后可重新发送</span>',
    error_send_failed: '验证码发送失败，请稍后再试。',
    error_verify_failed: '验证失败，请重新输入验证码。',
    error_invalid_code: '验证码无效或已过期。',
  },
  mfa: {
    totp_already_added: '你已添加过身份验证器应用，请先移除现有的。',
    totp_not_enabled: '身份验证器应用未启用，请联系管理员启用。',
    backup_code_already_added: '你已拥有有效的备份码，请先使用或移除它们再生成新的。',
    backup_code_not_enabled: '备份码未启用，请联系管理员启用。',
    backup_code_requires_other_mfa: '备份码需要先设置其他 MFA 方式。',
    passkey_not_enabled: 'Passkey 未启用，请联系管理员启用。',
  },
  update_success: {
    default: {
      title: '更新成功',
      description: '你的更改已成功保存。',
    },
    email: {
      title: '邮箱地址已更新！',
      description: '你的账号邮箱地址已成功更改。',
    },
    phone: {
      title: '手机号已更新！',
      description: '你的账号手机号已成功更改。',
    },
    username: {
      title: '用户名已更新！',
      description: '你的账号用户名已成功更改。',
    },

    password: {
      title: '密码已更新！',
      description: '你的账号密码已成功更改。',
    },
    totp: {
      title: '身份验证器应用已添加！',
      description: '身份验证器应用已成功关联到你的账号。',
    },
    backup_code: {
      title: '备用码已生成！',
      description: '您的备用码已保存。请将它们保存在安全的地方。',
    },
    backup_code_deleted: {
      title: '备用码已移除！',
      description: '您的备用码已从账户中移除。',
    },
    passkey: {
      title: 'Passkey 已添加！',
      description: 'Passkey 已成功关联到你的账号。',
    },
    passkey_deleted: {
      title: 'Passkey 已移除！',
      description: 'Passkey 已从你的账号中移除。',
    },
    social: {
      title: '社交账号已关联！',
      description: '社交账号已成功关联到你的账号。',
    },
  },
  backup_code: {
    title: '备用码',
    description:
      '如果您在两步验证时遇到问题，可以使用这些备用码中的一个来访问您的帐户。每个代码只能使用一次。',
    copy_hint: '请务必复制并保存在安全的地方。',
    generate_new_title: '生成新的备用码',
    generate_new: '生成新的备用码',
    delete_confirmation_title: '移除备用码',
    delete_confirmation_description: '如果移除这些备用码，您将无法使用它们进行验证。',
  },
  passkey: {
    title: 'Passkey',
    added: '添加时间：{{date}}',
    last_used: '上次使用：{{date}}',
    never_used: '从未使用',
    unnamed: '未命名的 Passkey',
    renamed: 'Passkey 已重命名。',
    add_another_title: '添加另一个 Passkey',
    add_another_description:
      '使用设备生物识别、安全密钥（例如 YubiKey）或其他可用方法注册您的 Passkey。',
    add_passkey: '添加 Passkey',
    delete_confirmation_title: '移除 Passkey',
    delete_confirmation_description: '确定要移除"{{name}}"吗？移除后您将无法使用此 Passkey 登录。',
    rename_passkey: '重命名 Passkey',
    rename_description: '为此 Passkey 输入新名称。',
  },
};

export default Object.freeze(account_center);
