const enterprise_subscription = {
  page_title: '订阅',
  title: '管理你的订阅',
  subtitle: '查看和管理你的多租户订阅详细信息和账单信息。',
  tab: {
    subscription: '订阅',
    billing_history: '账单历史',
  },
  subscription: {
    title: '订阅',
    description: '查看你当前订阅计划的使用详情和账单信息。',
    enterprise_plan_title: '企业计划',
    enterprise_plan_description: '这是你的企业计划订阅，该配额在你的企业订阅下的所有租户之间共享。',
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
