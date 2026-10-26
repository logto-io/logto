const enterprise_subscription = {
  page_title: '订阅',
  title: '管理你的订阅',
  subtitle: '用于管理你的多租户订阅和账单历史记录',
  tab: {
    subscription: '订阅',
    billing_history: '账单历史',
  },
  subscription: {
    title: '订阅',
    description: '轻松跟踪你的使用情况，查看你的下一个账单，并查看你的原始合同。',
    enterprise_plan_title: '企业计划',
    enterprise_plan_description:
      '这是你的企业计划订阅，此配额在各租户之间共享。使用情况的更新可能会有轻微的延迟。',
    add_on_title: '按需付费附加项',
    add_on_description:
      '这些是基于你的合同或 Logto 的标准按需付费费率的额外附加项。你将根据实际使用量收费。',
    included: '已包含',
    over_quota: '超出配额',
    basic_plan_column_title: {
      product: '产品',
      usage: '使用量',
      quota: '配额',
    },
    add_on_column_title: {
      product: '产品',
      unit_price: '单价',
      quantity: '数量',
      total_price: '总计',
    },
    add_on_sku_price: '¥{{price}}/月',
    private_region_title: '私有云实例 ({{regionName}})',
    shared_cross_tenants: '跨租户',
  },
  user_subscriptions: {
    description: '查看你的个人订阅和 Enterprise 合同额度，不受当前所选租户影响。',
    personal_title: '个人订阅',
    personal_description: '由你的账户支付的订阅，包括历史订阅。',
    price: '价格',
    billing_period: '账期',
    list_price_note: '价格不含税费和折扣。变更将按比例计入你的下一张账单。',
    overdue_note: '付款已逾期。如仍未付款，订阅可能会被暂停，其付费功能可能会被移除。',
    cancel_on: '计划于 {{date}} 取消',
    other_product: '其他订阅',
    enterprise_invoices_description:
      '你的 Enterprise 合同的发票。选择一张发票即可查看，并下载发票或收据。',
    personal_invoices_description:
      '向你的账户计费的订阅发票，包括以往的订阅。选择一张发票即可查看，并下载发票或收据。',
    credit_note: '移除或按比例计费产生的抵扣额会冲抵后续发票，不一定会立即退回到你的付款方式。',
    invoice_link_unavailable: '此发票页面不可用。如需副本，请联系我们。',
    status: {
      active: '有效',
      trialing: '试用中',
      past_due: '逾期',
      unpaid: '未付款',
      canceled: '已取消',
      incomplete: '未完成',
      incomplete_expired: '已过期',
      paused: '已暂停',
    },
  },
};

export default Object.freeze(enterprise_subscription);
