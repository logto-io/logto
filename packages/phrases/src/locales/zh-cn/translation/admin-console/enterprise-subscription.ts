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
};

export default Object.freeze(enterprise_subscription);
