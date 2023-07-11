const quota_table = {
  quota: {
    title: '配额',
    tenant_limit: '租户限制',
    base_price: '基础价格',
    mau_unit_price: '* MAU单价',
    mau_limit: 'MAU限制',
  },
  application: {
    title: '应用',
    total: '总数',
    m2m: '机器对机器',
  },
  resource: {
    title: 'API资源',
    resource_count: '资源数',
    scopes_per_resource: '每个资源的权限',
  },
  branding: {
    title: '品牌',
    custom_domain: '自定义域名',
  },
  user_authn: {
    title: '用户身份验证',
    omni_sign_in: '全渠道登录',
    built_in_email_connector: '内置电子邮件连接器',
    social_connectors: '社会化登录连接器',
    standard_connectors: '标准登录连接器',
  },
  roles: {
    title: '角色',
    roles: '角色',
    scopes_per_role: '每个角色的权限',
  },
  audit_logs: {
    title: '审计日志',
    retention: '保留时间',
  },
  hooks: {
    title: 'Hooks',
    amount: '数量',
  },
  support: {
    title: '支持',
    community: '社区',
    customer_ticket: '客户工单',
    premium: '高级',
  },
  mau_unit_price_footnote:
    '*我们的计费单价可能根据实际消耗的资源变化，并且Logto有权解释单价的任何变动。',
  unlimited: '无限制',
  contact: '联系',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/月',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}}天',
  days_other: '{{count, number}}天',
  add_on: '附加功能',
};

export default quota_table;
