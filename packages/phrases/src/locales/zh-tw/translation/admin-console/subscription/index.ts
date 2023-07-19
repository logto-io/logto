import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: '免費方案',
  free_plan_description: '適用於旁邊項目和開始使用 Logto 的試用。無需信用卡。',
  hobby_plan: '業餘方案',
  hobby_plan_description: '適用於個人開發人員或開發環境。',
  pro_plan: '專業方案',
  pro_plan_description: '企業無憂享受 Logto 服務。',
  enterprise: '企業版',
  current_plan: '當前方案',
  current_plan_description:
    '這是您當前的方案。您可以查看計劃使用情況、下一個帳單並升級到更高級別的計劃（如果需要）。',
  plan_usage: '計劃使用情況',
  plan_cycle: '計劃週期：{{period}}。使用情況訂閱日期為{{renewDate}}。',
  next_bill: '您的下一個帳單',
  next_bill_hint: '要了解更多計算方法，請參閱本<a>文章</a>。',
  next_bill_tip:
    '即將到期的帳單包括您的計劃下個月的基本價格，以及各級別 MAU 單價乘以使用量的費用。',
  manage_payment: '管理付款',
  overfill_quota_warning: '您已達到配額限制。為防止出現問題，請升級計畫。',
  upgrade_pro: '升級專業',
  payment_error:
    '偵測到付款問題。無法處理以前週期的 {{price, number}}$ 。更新付款以避免 Logto 服務中止。',
  downgrade: '降級',
  current: '當前',
  buy_now: '立即購買',
  contact_us: '聯絡我們',
  quota_table,
  billing_history: {
    invoice_column: '發票',
    status_column: '狀態',
    amount_column: '金額',
    invoice_created_date_column: '發票創建日期',
  },
  quota_item,
  downgrade_modal: {
    title: '您確定要降級嗎？',
    description:
      '如果您選擇切換到 <targetName/>，請注意您將不再使用之前在 <currentName/> 中的配額和功能。',
    before: '在此之前：<name/>',
    after: '在此之後：<name/>',
    downgrade: '降級',
    not_eligible: '您不符合降級資格',
    not_eligible_description: '在降級到 <name/> 之前，請確保符合以下條件。',
    a_maximum_of: '最大數量<item/>',
    help_tip: '需要協助降級嗎？<a>聯繫我們</a>。',
  },
  upgrade_success: '已成功升級到 <name/>',
  downgrade_success: '已成功降級到 <name/>',
  subscription_check_timeout: '訂閱檢查已逾時，請稍後重新刷新。',
};

export default subscription;
