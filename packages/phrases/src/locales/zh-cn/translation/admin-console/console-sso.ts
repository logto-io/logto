const console_sso = {
  title: 'Console SSO',
  empty_title: '使用 SSO 安全访问控制台',
  empty_description: '添加身份提供商，让团队通过 SSO 登录 Logto Cloud 控制台。',
  scope_description: 'Console SSO 用于登录 Logto Cloud 控制台，不会授予租户成员资格。',
  resume_creation: '发现未完成的创建操作。请使用同一身份提供商继续，以恢复此连接器。',
  no_customer: '没有可用于直接创建连接器的默认账单账户。请联系支持团队配置客户归属。',
  domain_bound: '已绑定',
  domain_pending: '等待 DNS 验证',
  back_to_subscription: '返回订阅',
  delete_confirmation: '删除此 Console SSO 连接器？用户将无法再通过它登录 Cloud 控制台。',
};

export default Object.freeze(console_sso);
