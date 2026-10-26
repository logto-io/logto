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
  user_subscriptions: {
    description: '檢視你的個人訂閱與 Enterprise 合約額度，不受目前所選租戶影響。',
    personal_title: '個人訂閱',
    personal_description: '由你的帳戶支付的訂閱，包括歷史訂閱。',
    price: '價格',
    billing_period: '帳期',
    list_price_note: '價格不含稅費和折扣。變更將按比例計入你的下一張帳單。',
    overdue_note: '付款已逾期。如仍未付款，訂閱可能會被暫停，其付費功能可能會被移除。',
    cancel_on: '預定於 {{date}} 取消',
    other_product: '其他訂閱',
    enterprise_invoices_description:
      '你的 Enterprise 合約的發票。選擇一張發票即可查看，並下載發票或收據。',
    personal_invoices_description:
      '向你的帳戶計費的訂閱發票，包括以往的訂閱。選擇一張發票即可查看，並下載發票或收據。',
    credit_note: '移除或按比例計費產生的抵扣額會沖抵後續發票，不一定會立即退回到你的付款方式。',
    invoice_link_unavailable: '此發票頁面無法使用。如需副本，請聯絡我們。',
    status: {
      active: '有效',
      trialing: '試用中',
      past_due: '逾期',
      unpaid: '未付款',
      canceled: '已取消',
      incomplete: '未完成',
      incomplete_expired: '已到期',
      paused: '已暫停',
    },
  },
};

export default Object.freeze(enterprise_subscription);
