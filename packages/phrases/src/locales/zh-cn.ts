import en from './en';

const translation = {
  sign_in: {
    title: '登录',
    loading: '登录中...',
    error: '用户名或密码错误。',
    username: '用户名',
    password: '密码',
  },
  register: {
    create_account: '新用户注册',
    title: '注册',
    loading: '注册中...',
    have_account: '已经有账户？',
  },
};

const errors = {
  guard: {
    invalid_input: '请求内容有误。',
  },
  oidc: {
    aborted: '用户终止了交互。',
  },
  register: {
    username_exists: '用户名已存在。',
  },
  sign_in: {
    invalid_credentials: '用户名或密码错误，请检查您的输入。',
    invalid_sign_in_method: '当前登录方式不可用。',
    insufficient_info: '登录信息缺失，请检查您的输入。',
  },
  swagger: {
    invalid_zod_type: '无效的 Zod 类型，请检查路由 guard 配置。',
  },
};

const zhCN: typeof en = Object.freeze({
  translation,
  errors,
});

export default zhCN;
