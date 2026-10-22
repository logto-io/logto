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
  user_subscriptions: {
    description: '查看你的個人訂閱及 Enterprise 合約額度，不受目前所選租戶影響。',
    personal_title: '個人訂閱',
    personal_description: '由你的帳戶支付的訂閱，包括過往訂閱。',
    enterprise_description:
      'Console SSO 額度由合約訂明，並由獲授權的管理員共用。個人訂閱獨立收費。',
    allowance: '合約額度',
    not_covered: '此 Enterprise 方案不包含 Console SSO 額度。新建的連接器將透過個人訂閱收費。',
    quantity_price: '數量 × 單價',
    billing_period: '帳期',
    connectors: 'Console SSO 連接器',
    no_connectors: '暫無連接器',
    list_price_note:
      '顯示的數量、單價和狀態來自訂閱記錄。暫停收款可能不會改變數量和狀態。單價不包括稅項、折扣及按比例調整，不代表目前收費或應付金額。',
    proration_note:
      '增減 Console SSO 連接器產生的按比例調整會在定期帳單中結算。刪除最後一個付費連接器會取消並結算訂閱。',
    overdue_note:
      '連續三個帳期未付款且重試次數用盡後，將暫停收款並移除付費 Console SSO 連接器。更新付款資料不會恢復其設定。如需協助，請聯絡我們。',
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
