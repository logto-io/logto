import quota_item from './quota-item.js';
import quota_table from './quota-table.js';
import usage from './usage.js';

const subscription = {
  free_plan: '免費方案',
  free_plan_description: '適用於旁邊項目和開始使用 Logto 的試用。無需信用卡。',
  pro_plan: '專業方案',
  pro_plan_description: '企業無憂享受 Logto 服務。',
  enterprise: '企業方案',
  enterprise_description: '適用於具有企業級要求的大型團隊和企業。',
  admin_plan: '管理員方案',
  dev_plan: '開發方案',
  current_plan: '當前方案',
  current_plan_description:
    '這是您目前的方案。您可以輕鬆查看您的方案使用情況，檢查即將到來的帳單，並根據需要進行變更。',
  plan_usage: '計劃使用情況',
  plan_cycle: '計劃週期：{{period}}。使用情況訂閱日期為{{renewDate}}。',
  next_bill: '您的即將到來的帳單',
  next_bill_hint: '要了解更多計算方法，請參閱本<a>文章</a>。',
  next_bill_tip:
    '此處顯示的價格不含稅，更新可能會有輕微延遲。稅額將根據你提供的信息和當地法規計算，並顯示在您的發票中。',
  manage_payment: '管理付款',
  overfill_quota_warning: '你已達到配額限制。為防止出現問題，請升級計畫。',
  upgrade_pro: '升級專業',
  update_payment: '更新付款信息',
  payment_error:
    '偵測到付款問題。無法處理以前週期的 {{price, number}}$ 。更新付款以避免 Logto 服務中止。',
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
      open: '未完成',
      uncollectible: '逾期未付款',
    },
  },
  quota_item,
  downgrade_modal: {
    title: '你確定要降級嗎？',
    description:
      '如果你選擇切換到 <targetName/>，請注意你將不再使用之前在 <currentName/> 中的配額和功能。',
    before: '在此之前：<name/>',
    after: '在此之後：<name/>',
    downgrade: '降級',
  },
  not_eligible_modal: {
    downgrade_title: '你不符合降級條件',
    downgrade_description: '降級到<name/>前，請確保符合以下條件。',
    downgrade_help_tip: '需要降級幫助？<a>聯絡我們</a>。',
    upgrade_title: '致尊敬的早期採用者的友善提醒',
    upgrade_description:
      '你目前的使用量超過了 <name /> 允許的範圍。Logto 現已正式發布，包括針對每個計劃量身定制的功能。在考慮升級到 <name /> 之前，請確保你符合以下升級條件。',
    upgrade_pro_tip: ' 或者考慮升級到專業版計劃。',
    upgrade_help_tip: '需要升級幫助？<a>聯絡我們</a>。',
    a_maximum_of: '最多<item/>',
  },
  upgrade_success: '已成功升級到 <name/>',
  downgrade_success: '已成功降級到 <name/>',
  subscription_check_timeout: '訂閱檢查已逾時，請稍後重新刷新。',
  no_subscription: '無訂閱',
  usage,
  token_usage_notification: {
    exceeded: '你已超過 100% 的配額限制。使用者將無法正常登入。請立即升級以避免任何不便。',
    close_to_limit:
      '你幾乎達到令牌使用限制。如果使用量超過 100%，Logto 將停止提供令牌。請升級免費方案以避免任何不便。',
    dev_plan_exceeded: "此租戶已達到 Logto's 實體限制政策的令牌限制。",
  },
};

export default Object.freeze(subscription);
