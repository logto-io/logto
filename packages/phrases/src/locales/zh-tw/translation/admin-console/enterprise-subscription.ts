const enterprise_subscription = {
  page_title: '訂閱',
  title: '管理你的訂閱',
  subtitle: '用來管理你的多租戶訂閱和賬單歷史',
  tab: {
    subscription: '訂閱',
    billing_history: '賬單歷史',
  },
  subscription: {
    title: '訂閱',
    description: '輕鬆跟踪你的使用情況，查看下次賬單，並審查你的原始合約。',
    enterprise_plan_title: '企業方案',
    enterprise_plan_description:
      '這是你的企業方案訂閱，配額在租戶間共享。使用情況更新可能會有輕微的延遲。',
    add_on_title: '按需付費附加功能',
    add_on_description:
      '這些是基於你的合約或 Logto 標準按需付費利率的附加功能。將根據你的實際使用情況收費。',
    included: '包含',
    over_quota: '超出配額',
    basic_plan_column_title: {
      product: '產品',
      usage: '使用量',
      quota: '配額',
    },
    add_on_column_title: {
      product: '產品',
      unit_price: '單價',
      quantity: '數量',
      total_price: '總計',
    },
    add_on_sku_price: '${{price}}/月',
    private_region_title: '私有雲實例 ({{regionName}})',
    shared_cross_tenants: '租戶間共享',
  },
};

export default Object.freeze(enterprise_subscription);
