const subscription = {
  free_plan: '免费套餐',
  free_plan_description: '用于临时项目和初次Logto试用。无需信用卡。',
  hobby_plan: '业余套餐',
  hobby_plan_description: '适用于个人开发者或开发环境。',
  pro_plan: '专业套餐',
  pro_plan_description: '为企业提供无忧的 Logto 服务。',
  enterprise: '企业版',
  current_plan: '当前套餐',
  current_plan_description:
    '这是您当前的套餐。您可以查看套餐使用情况、下一个账单，如果愿意，还可以升级到更高层级的套餐。',
  plan_usage: '套餐使用情况',
  plan_cycle: '套餐周期：{{period}}。使用量在 {{renewDate}} 后续费。',
  next_bill: '下一个账单',
  next_bill_hint: '如需了解更多计算方式，请参考这篇<a>文章</a>。',
  next_bill_tip:
    '您即将支付的账单包括下个月套餐的基本价格，以及在各个层级上，基于每月活跃用户（MAU）单价乘以使用量的成本。',
  manage_payment: '管理支付',
  overfill_quota_warning: '您已达到配额限制。为了避免任何问题，请升级套餐。',
  upgrade_pro: '升级专业版',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    '检测到付款问题。无法处理先前周期的 ${{price, number}}。为避免 Logto 服务暂停，请更新付款方式。',
  downgrade: '降级',
  current: '当前',
  buy_now: '立即购买',
  contact_us: '联系我们',
  quota_table: {
    quota: {
      title: '配额',
      tenant_limit: '租户限制',
      base_price: '基础价格',
      mau_unit_price: '* MAU 单价',
      mau_limit: 'MAU 限制',
    },
    application: {
      title: '应用',
      total: '总数',
      m2m: '机器对机器',
    },
    resource: {
      title: 'API 资源',
      resource_count: '资源计数',
      scopes_per_resource: '每个资源的权限',
    },
    branding: {
      title: '品牌',
      custom_domain: '自定义域名',
    },
    user_authn: {
      title: '用户认证',
      omni_sign_in: '全球签入',
      built_in_email_connector: '内建邮件连接器',
      social_connectors: '社交连接器',
      standard_connectors: '标准连接器',
    },
    roles: {
      title: '角色',
      roles: '角色',
      scopes_per_role: '每个角色的权限',
    },
    audit_logs: {
      title: '审核日志',
      retention: '保留期',
    },
    hooks: {
      title: '钩子',
      amount: '数量',
    },
    support: {
      title: '支持',
      community: '社区',
      customer_ticket: '客户工单',
      premium: '高级',
    },
    mau_unit_price_footnote:
      '* 我们的单价可能根据实际消耗的资源而变化，Logto 保留解释单价变动的权利。',
    unlimited: '无限制',
    contact: '联系',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '每月 ${{value, number}}',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '每 MAU ${{value, number}}',
    days_one: '{{count, number}} 天',
    days_other: '{{count, number}} 天',
    add_on: '附加功能',
  },
  downgrade_form: {
    allowed_title: '确定要降级吗？',
    allowed_description: '降级为 {{plan}} 后，您将不再享有以下优惠。',
    not_allowed_title: '您无法降级',
    not_allowed_description:
      '在降级为 {{plan}} 之前，请确保您符合以下标准。在调和和履行要求后，您将有资格降级。',
    confirm_downgrade: '仍要降级',
  },
};

export default subscription;
