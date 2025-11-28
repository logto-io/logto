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
    verification_title: '输入手机验证码',
    verification_description: '验证码已发送到你的手机 {{phone_number}}。',
    success: '已成功关联主要手机号。',
    verification_required: '验证已失效，请重新验证身份。',
  },

  code_verification: {
    send: '发送验证码',
    resend: '重新发送',
    resend_countdown: '还没有收到？{{seconds}} 秒后可重新发送。',
  },

  email_verification: {
    title: '验证您的邮箱',
    prepare_description: '为保护账户安全，请确认是您本人。发送验证码到您的邮箱。',
    email_label: '邮箱地址',
    send: '发送验证码',
    description: '验证码已发送至您的邮箱 {{email}}。请输入验证码以继续。',
    resend: '重新发送',
    resend_countdown: '还没有收到？{{seconds}} 秒后可重新发送。',
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
    resend: '重新发送',
    resend_countdown: '还没有收到？{{seconds}} 秒后可重新发送。',
    error_send_failed: '验证码发送失败，请稍后再试。',
    error_verify_failed: '验证失败，请重新输入验证码。',
    error_invalid_code: '验证码无效或已过期。',
  },
};

export default Object.freeze(account_center);
