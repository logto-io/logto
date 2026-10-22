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
    enterprise_description:
      'Console SSO 额度由合同约定，并由获授权的管理员共享。个人订阅单独计费。',
    allowance: '合同额度',
    not_covered: '此 Enterprise 方案不包含 Console SSO 额度。新建的连接器将通过个人订阅计费。',
    quantity_price: '数量 × 单价',
    billing_period: '账期',
    connectors: 'Console SSO 连接器',
    no_connectors: '暂无连接器',
    list_price_note:
      '所示数量、单价和状态来自订阅记录。暂停收款可能不会改变数量和状态。单价不含税费、折扣及按比例调整，不代表当前收费或应付金额。',
    proration_note:
      '增减 Console SSO 连接器产生的按比例调整会在常规账单中结算。删除最后一个付费连接器会取消并结算订阅。',
    overdue_note:
      '连续三个账期未付款且重试耗尽后，将暂停收款并移除付费 Console SSO 连接器。更新付款信息不会恢复其配置。如需帮助，请联系我们。',
    cancel_on: '计划于 {{date}} 取消',
    other_product: '其他订阅',
    billing_history_title: '账单历史',
    billing_history_description:
      '你的个人订阅和 Enterprise 合同的发票。选择一张发票即可查看，并下载发票或收据。',
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
