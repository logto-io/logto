import paywall from './paywall.js';

const upsell = {
  upgrade_plan: '升級計劃',
  compare_plans: '比較計劃',
  view_plans: '查看計劃',
  create_tenant: {
    title: '選擇您的租戶計劃',
    description:
      'Logto 提供創新且經濟實惠的定價計劃，旨在為不斷發展的公司提供競爭優勢。 <a>了解更多</a>',
    base_price: '基礎價格',
    monthly_price: '每月 {{value， number}}',
    mau_unit_price: 'MAU 單價',
    view_all_features: '查看所有功能',
    select_plan: '選擇<name/>',
    free_tenants_limit: '最多{{count， number}}個免費租戶',
    free_tenants_limit_other: '最多{{count， number}}個免費租戶',
    most_popular: '最受歡迎',
    upgrade_success: '成功升級至<name/>',
  },
  mau_exceeded_modal: {
    title: 'MAU 超過限制，請升級您的計劃。',
    notification:
      '您當前的 MAU 已超過<planName/>的限制。請立即升級到高級計劃，以避免 Logto 服務的暫停。',
    update_plan: '更新計劃',
  },
  payment_overdue_modal: {
    title: '賬單逾期未付',
    notification:
      '糟糕！租戶<span>{{name}}</span>的賬單支付失敗。請儘快支付賬單，以避免 Logto 服務的中止。',
    unpaid_bills: '未付賬單',
    update_payment: '更新支付',
  },
  charge_notification_for_quota_limit:
    '你已經達到你的配額限制。一旦我們確定價格，超出配額限制的功能可能會作為附加組件而被收費。',
  charge_notification_for_token_limit:
    '你已經達到你的{{value}}M令牌配額限制。一旦我們確定價格，超出配額限制的功能可能會作炂附加組件而被收費。',
  charge_notification_for_m2m_app_limit:
    '你已經達到你的機器對機器配額限制。一旦我們確定價格，超出配額限制的功能可能會作炂附加組件而被收費。',
  paywall,
};

export default Object.freeze(upsell);
