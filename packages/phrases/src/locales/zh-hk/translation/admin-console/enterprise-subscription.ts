const enterprise_subscription = {
  page_title: '訂閱',
  title: '管理你的訂閱',
  subtitle: '這是用來管理你的多租戶訂閱和帳單歷史',
  tab: {
    subscription: '訂閱',
    billing_history: '帳單歷史',
  },
  subscription: {
    title: '訂閱',
    description: '輕鬆追踪你的使用情況，查看你的下次帳單，並查看你的原始合約。',
    enterprise_plan_title: '企業計劃',
    enterprise_plan_description:
      '這是你的企業計劃訂閱，這個配額是跨租戶共享的。使用情況的更新可能會有輕微的延遲。',
    add_on_title: '按使用量付費的附加功能',
    add_on_description:
      '這些是基於你的合約或 Logto 的標準按使用量付費費率的附加功能。你將根據你的實際使用量進行收費。',
    included: '已包含',
    over_quota: '超出配額',
    basic_plan_column_title: {
      product: '產品',
      usage: '使用情況',
      quota: '配額',
    },
    add_on_column_title: {
      product: '產品',
      unit_price: '單價',
      quantity: '數量',
      total_price: '總計',
    },
    add_on_sku_price: '${{price}}/月',
    private_region_title: '私有雲實例（{{regionName}}）',
    shared_cross_tenants: '跨租戶',
  },
};

export default Object.freeze(enterprise_subscription);
