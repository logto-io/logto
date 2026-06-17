const request = {
  invalid_input: '输入无效。{{details}}',
  general: '发生请求错误。',
  range_not_satisfiable: '范围不满足。',
  feature_not_supported: '当前环境不支持此功能。',
  rate_limited: '请求过于频繁，请稍后再试。',
};

export default Object.freeze(request);
