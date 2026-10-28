const step_up = {
  verify_your_identity: '验证你的身份',
  choose_method_description: '请通过以下任一方式确认是你本人，以继续操作。',
  password: '密码',
  password_description: '输入你的账户密码',
  enter_password_description: '输入你的账户密码以继续。',
  enter_verification_code_description: '输入发送至 {{identifier}} 的验证码。',
  subject_proof_description:
    '请通过与你账户关联的账户确认是你本人，以继续操作。之后你可以设置一种验证方式。',
  subject_mismatch: '账号不匹配',
  subject_mismatch_description:
    '你使用的账号未关联到你的账户。请使用已关联的账号；如有需要，请先在第三方服务商处切换账号。',
  no_method_available: '没有可用的验证方式',
  no_method_available_description: '你的账户没有可完成此验证的方式。请联系管理员获取帮助。',
};

export default Object.freeze(step_up);
