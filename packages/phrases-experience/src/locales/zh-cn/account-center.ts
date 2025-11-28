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
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
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
    success: 'Primary email linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  phone: {
    title: 'Link phone',
    description: 'Link your phone number to sign in or help with account recovery.',
    verification_title: 'Enter phone verification code',
    verification_description: 'The verification code has been sent to your phone {{phone_number}}.',
    success: 'Primary phone linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },

  email_verification: {
    title: '验证您的邮箱',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
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
    send: 'Send verification code',
    description: '验证码已发送至您的手机 {{phone}}。请输入验证码以继续。',
    resend: '重新发送',
    resend_countdown: '还没有收到？{{seconds}} 秒后可重新发送。',
    error_send_failed: '验证码发送失败，请稍后再试。',
    error_verify_failed: '验证失败，请重新输入验证码。',
    error_invalid_code: '验证码无效或已过期。',
  },
};

export default Object.freeze(account_center);
