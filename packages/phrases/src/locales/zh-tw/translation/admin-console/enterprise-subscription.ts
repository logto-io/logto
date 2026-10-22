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
    enterprise_description:
      'Console SSO 額度由合約約定，並由獲授權的管理員共用。個人訂閱分開計費。',
    allowance: '合約額度',
    not_covered: '此 Enterprise 方案不包含 Console SSO 額度。新建的連接器將透過個人訂閱計費。',
    quantity_price: '數量 × 單價',
    billing_period: '帳期',
    connectors: 'Console SSO 連接器',
    no_connectors: '暫無連接器',
    list_price_note:
      '顯示的數量、單價和狀態來自訂閱紀錄。暫停收款可能不會改變數量和狀態。單價不含稅費、折扣及按比例調整，不代表目前收費或應付金額。',
    proration_note:
      '增減 Console SSO 連接器產生的按比例調整會於例行帳單中結算。刪除最後一個付費連接器會取消並結算訂閱。',
    overdue_note:
      '連續三個帳期未付款且重試次數用盡後，將暫停收款並移除付費 Console SSO 連接器。更新付款資訊不會恢復其設定。如需協助，請聯絡我們。',
    cancel_on: '預定於 {{date}} 取消',
    other_product: '其他訂閱',
    billing_history_title: '帳單紀錄',
    billing_history_description:
      '你的個人訂閱和 Enterprise 合約的發票。選擇一張發票即可查看，並下載發票或收據。',
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
