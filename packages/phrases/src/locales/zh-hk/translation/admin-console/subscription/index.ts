import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: '免費計劃',
  free_plan_description: '用於側建項目和Logto初試。無需信用卡。',
  hobby_plan: '愛好計劃',
  hobby_plan_description: '用於個人開發者或開發環境。',
  pro_plan: '專業計劃',
  pro_plan_description: '供企業放心使用Logto。',
  enterprise: '企業',
  current_plan: '當前計劃',
  current_plan_description:
    '這是您的當前計劃。您可以查看計劃使用情況，下一個帳單和升級到更高級別計劃。',
  plan_usage: '計劃使用情況',
  plan_cycle: '計劃週期：{{period}}。使用情況將在{{renewDate}}重新啟動。',
  next_bill: '您的下個帳單',
  next_bill_hint: '要了解有關計算的更多信息，請參閱這篇<a>文章</a>。',
  next_bill_tip:
    '您即將到來的帳單包括下個月計劃的基本價格，以及各個層級中MAU單價乘以您使用量的成本。',
  manage_payment: '管理付款',
  overfill_quota_warning: '您已達到配額限制。請升級計劃以防止任何問題。',
  upgrade_pro: '升級到專業版',
  payment_error:
    '檢測到付款問題。無法處理前一個週期的$ {{price, number}}。更新付款以避免Logto服務暫停。',
  downgrade: '降級',
  current: '當前',
  buy_now: '立即購買',
  contact_us: '聯繫我們',
  quota_table,
  billing_history: {
    invoice_column: '發票',
    status_column: '狀態',
    amount_column: '金額',
    invoice_created_date_column: '發票創建日期',
  },
  quota_item,
  downgrade_modal: {
    title: '確定要降級嗎？',
    description:
      '如果您選擇切換到<targetName/>，請注意您將不再能夠訪問以前在<currentName/>中的配額和功能。',
    before: '之前：<name/>',
    after: '之後：<name/>',
    downgrade: '降級',
    not_eligible: '您不符合降級的資格',
    not_eligible_description: '在降級到<name/>之前，請確保符合以下標準。',
    a_maximum_of: '最多：<item/>',
    help_tip: '需要協助降級嗎？<a>聯繫我們</a>。',
  },
  upgrade_success: '升級成功至<name/>',
  downgrade_success: '成功降級至<name/>',
};

export default subscription;
