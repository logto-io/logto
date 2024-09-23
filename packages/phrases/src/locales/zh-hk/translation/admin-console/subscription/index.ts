import quota_item from './quota-item.js';
import quota_table from './quota-table.js';
import usage from './usage.js';

const subscription = {
  free_plan: '免費計劃',
  free_plan_description: '用於側建項目和 Logto 初試。無需信用卡。',
  pro_plan: '專業計劃',
  pro_plan_description: '供企業放心使用 Logto。',
  enterprise: '企業計劃',
  /** UNTRANSLATED */
  enterprise_description: 'For large teams and businesses with enterprise-grade requirements.',
  admin_plan: '管理員計劃',
  dev_plan: '開發計劃',
  current_plan: '當前計劃',
  current_plan_description:
    '以下是你目前的計劃。你可以輕鬆查看計劃使用情況，檢查即將到來的帳單，並根據需要進行變更。',
  plan_usage: '計劃使用情況',
  plan_cycle: '計劃週期：{{period}}。使用情況將在 {{renewDate}} 重新啟動。',
  next_bill: '你的即將到來的帳單',
  next_bill_hint: '要了解有關計算的更多信息，請參閱這篇<a>文章</a>。',
  next_bill_tip:
    '這裡顯示的價格不含稅，可能會有更新稍有延遲。稅額將根據你提供的信息和當地法規要求計算，並在你的發票中顯示。',
  manage_payment: '管理付款',
  overfill_quota_warning: '你已達到配額限制。請升級計劃以防止任何問題。',
  upgrade_pro: '升級到專業版',
  update_payment: '更新付款信息',
  payment_error:
    '檢測到付款問題。無法處理前一個週期的 ${{price, number}}。更新付款以避免 Logto 服務暫停。',
  downgrade: '降級',
  current: '當前',
  upgrade: '升級',
  quota_table,
  billing_history: {
    invoice_column: '發票',
    status_column: '狀態',
    amount_column: '金額',
    invoice_created_date_column: '發票創建日期',
    invoice_status: {
      void: '已取消',
      paid: '已付款',
      open: '未結算',
      uncollectible: '逾期未付款',
    },
  },
  quota_item,
  downgrade_modal: {
    title: '確定要降級嗎？',
    description:
      '如果你選擇切換到 <targetName/>，請注意你將不再能夠訪問以前在 <currentName/> 中的配額和功能。',
    before: '之前：<name/>',
    after: '之後：<name/>',
    downgrade: '降級',
  },
  not_eligible_modal: {
    downgrade_title: '你不符合降級條件',
    downgrade_description: '降級到 <name/> 前，請確保符合以下條件。',
    downgrade_help_tip: '需要降級幫助？<a>聯絡我們</a>。',
    upgrade_title: '致尊敬的早期採用者的友善提醒',
    upgrade_description:
      '你目前的使用量超過了 <name /> 允許的範圍。Logto 現已正式發布，包括針對每個計劃量身定制的功能。在考慮升級到 <name /> 之前，請確保你符合以下升級條件。',
    upgrade_pro_tip: ' 或者考慮升級到專業版計劃。',
    upgrade_help_tip: '需要升級幫助？<a>聯絡我們</a>。',
    a_maximum_of: '最多 <item/>',
  },
  upgrade_success: '升級成功至 <name/>',
  downgrade_success: '成功降級至 <name/>',
  subscription_check_timeout: '訂閱檢查已逾時，請稍後重新刷新。',
  no_subscription: '沒有訂閱',
  usage,
};

export default Object.freeze(subscription);
