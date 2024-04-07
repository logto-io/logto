import featured_plan_content from './featured-plan-content.js';
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
    monthly_price: '每月 {{value, number}}',
    view_all_features: '查看所有功能',
    select_plan: '選擇<name/>',
    free_tenants_limit: '最多{{count, number}}個免費租戶',
    free_tenants_limit_other: '最多{{count, number}}個免費租戶',
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
      '糟糕！租戶<span>{{name}}</span>的賬單支付失敗。請儘快支付賬單，以避免Logto服務中止。',
    unpaid_bills: '未付賬單',
    update_payment: '更新支付',
  },
  add_on_quota_item: {
    api_resource: 'API 資源',
    machine_to_machine: '機器對機器應用',
    tokens: '{{limit}}M 令牌',
    /** UNTRANSLATED */
    tenant_member: 'tenant member',
  },
  charge_notification_for_quota_limit:
    '您已超出{{item}}配額限制。Logto將為超出配額限制的使用添加費用。計費將從新的附加定價設計發布當天開始。 <a>了解更多</a>',
  paywall,
  featured_plan_content,
};

export default Object.freeze(upsell);
