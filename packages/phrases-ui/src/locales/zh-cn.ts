import type { LocalePhrase } from '../types';

const translation = {
  input: {
    username: '用户名',
    password: '密码',
    email: '邮箱',
    phone_number: '手机号',
    confirm_password: '确认密码',
  },
  secondary: {
    sign_in_with: '通过 {{methods, list(type: disjunction;), zhOrSpaces}} 登录',
    register_with: 'Create account with {{methods, list(type: disjunction;)}}', // UNTRANSLATED
    social_bind_with:
      '绑定到已有账户? 使用 {{methods, list(type: disjunction;), zhOrSpaces}} 登录并绑定。',
  },
  action: {
    sign_in: '登录',
    continue: '继续',
    create_account: '创建帐号',
    create: '创建',
    enter_passcode: '输入验证码',
    cancel: '取消',
    confirm: '确认',
    save_password: '保存密码',
    bind: '绑定到 {{address}}',
    back: '返回',
    nav_back: '返回',
    agree: '同意',
    got_it: '知道了',
    sign_in_with: '通过 {{name}} 登录',
    forgot_password: '重置密码',
    switch_to: '用{{method}}登录',
    sign_in_via_passcode: 'Sign in via verification code', // UNTRANSLATED
  },
  description: {
    email: '邮箱',
    phone_number: '手机',
    reminder: '提示',
    not_found: '404 页面不存在',
    agree_with_terms: '我已阅读并同意 ',
    agree_with_terms_modal: '请先同意 <link></link> 以继续',
    terms_of_use: '使用条款',
    create_account: '创建帐号',
    or: '或',
    enter_passcode: '验证码已经发送至你的{{ address }}',
    passcode_sent: '验证码已经发送',
    resend_after_seconds: '在 <span>{{ seconds }}</span> 秒后重发',
    resend_passcode: '重发验证码',
    continue_with: '通过以下方式继续',
    create_account_id_exists: '{{ type }}为 {{ value }} 的帐号已存在，你要登录吗？',
    sign_in_id_does_not_exists: '{{ type }}为 {{ value }} 的帐号不存在，你要创建一个新帐号吗？',
    forgot_password_id_does_not_exits: '{{ type }}为 {{ value }} 的帐号不存在。',
    bind_account_title: '绑定帐号',
    social_create_account: '没有帐号？你可以创建一个帐号并绑定。',
    social_bind_account: '已有帐号？登录以绑定社交身份。',
    social_bind_with_existing: '找到了一个匹配的帐号，你可以直接绑定。',
    reset_password: '重设密码',
    reset_password_description_email: '输入邮件地址，领取验证码以重设密码。',
    reset_password_description_sms: '输入手机号，领取验证码以重设密码。',
    new_password: '新密码',
    password_changed: '已重置密码！',
    no_account: "Don't have an account?", // UNTRANSLATED
    have_account: 'Already have an account?', // UNTRANSLATED
    enter_password: 'Enter Password', // UNTRANSLATED
    enter_password_for: 'Enter the password of {{method}} {{value}}', // UNTRANSLATED
  },
  error: {
    username_password_mismatch: '用户名和密码不匹配',
    username_required: '用户名必填',
    password_required: '密码必填',
    username_exists: '用户名已存在',
    username_should_not_start_with_number: '用户名不能以数字开头',
    username_valid_charset: '用户名只能包含英文字母、数字或下划线。',
    invalid_email: '无效的邮箱',
    invalid_phone: '无效的手机号',
    password_min_length: '密码最少需要{{min}}个字符',
    passwords_do_not_match: '你两次输入的密码不一致，请立即确认。',
    invalid_passcode: '无效的验证码',
    invalid_connector_auth: '登录失败',
    invalid_connector_request: '无效的登录请求',
    unknown: '未知错误，请稍后重试。',
    invalid_session: '未找到会话，请返回并重新登录。',
  },
};

const zhCN: LocalePhrase = Object.freeze({
  translation,
});

export default zhCN;
