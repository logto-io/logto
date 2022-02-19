import en from './en';

const translation = {
  sign_in: {
    action: '登录',
    loading: '登录中...',
    error: '用户名或密码错误。',
    username: '用户名',
    password: '密码',
  },
  register: {
    create_account: '创建新账户',
    action: '创建',
    loading: '创建中...',
    have_account: '已经有账户？',
  },
};

const errors = {
  auth: {
    authorization_header_missing: 'Authorization 请求 header 遗漏。',
    authorization_token_type_not_supported: '不支持的 authorization 类型。',
    unauthorized: '未授权。请检查相关 credentials 和 scope。',
    jwt_sub_missing: 'JWT 中找不到 `sub`。',
  },
  guard: {
    invalid_input: '请求内容有误。',
    invalid_pagination: '分页参数有误。',
  },
  oidc: {
    aborted: '用户终止了交互。',
    invalid_scope: '不支持的 scope: {{scopes}}。',
    invalid_scope_plural: '不支持的 scope: {{scopes}}。',
    invalid_token: 'token 无效。',
    invalid_client_metadata: '无效 client metadata。',
    insufficient_scope: '请求 token 缺少一下权限: {{scopes}}。',
    invalid_request: '请求失败。',
    invalid_grant: '授权失败。',
    invalid_redirect_uri: '无效返回链接, 该 redirect_uri 未被此应用注册。',
    access_denied: '拒绝访问。',
    invalid_target: '请求资源无效。',
    unsupported_grant_type: '不支持的 grant_type。',
    unsupported_response_mode: '不支持的 response_mode。',
    unsupported_response_type: '不支持的 response_type。',
    provider_error: 'OIDC 错误: {{message}}。',
  },
  user: {
    username_exists_register: '用户名已被注册。',
    email_exists_register: '邮箱地址已被注册。',
    phone_exists_register: '手机号码已被注册。',
    invalid_email: '邮箱地址不正确。',
    invalid_phone: '手机号码不正确。',
    email_not_exists: '邮箱地址尚未注册。',
    phone_not_exists: '手机号码尚未注册。',
    identity_not_exists: '该社交账号尚未注册。',
    identity_exists: '该社交账号已被注册。',
  },
  password: {
    unsupported_encryption_method: '不支持的加密方法 {{name}}。',
    pepper_not_found: '密码 pepper 未找到。请检查 core 的环境变量。',
  },
  session: {
    not_found: 'Session not found. Please go back and sign in again.',
    invalid_credentials: '用户名或密码错误，请检查您的输入。',
    invalid_sign_in_method: '当前登录方式不可用。',
    insufficient_info: '登录信息缺失，请检查您的输入。',
    invalid_connector_id: '无法找到 ID 为 {{connectorId}} 的可用连接器。',
    connector_id_mismatch: '传入的 connectorId 与 session 中保存的记录不一致。',
    connector_session_not_found: '无法找到 connector 登录信息，请尝试重新登录。',
    unauthorized: '请先登录。',
  },
  connector: {
    general: 'Connector 发生未知错误。',
    not_found: '找不到可用的 {{type}} 类型的连接器。',
    not_enabled: '连接器尚未启用。',
    invalid_config: 'Connector 配置错误。',
    template_not_found: '无法从 connector 配置中找到对应的模板。',
    access_token_invalid: '当前连接器的 access_token 无效。',
    oauth_code_invalid: '无法获取 access_token，请检查授权 code 是否有效。',
  },
  passcode: {
    phone_email_empty: '手机号与邮箱地址均为空。',
    not_found: '验证码不存在，请先请求发送验证码。',
    phone_mismatch: '手机号码不匹配. 请尝试请求新的验证码。',
    email_mismatch: '邮箱地址不匹配. 请尝试请求新的验证码。',
    code_mismatch: '验证码不正确。',
    expired: '验证码已过期. 请尝试请求新的验证码。',
    exceed_max_try: '超过最大验证次数. 请尝试请求新的验证码。',
  },
  swagger: {
    invalid_zod_type: '无效的 Zod 类型，请检查路由 guard 配置。',
  },
  entity: {
    create_failed: '创建 {{name}} 失败。',
    not_exists: '该 {{name}} 不存在。',
    not_exists_with_id: 'ID 为 `{{id}}` 的 {{name}} 不存在。',
    not_found: '该资源不存在',
  },
};

const zhCN: typeof en = Object.freeze({
  translation,
  errors,
});

export default zhCN;
