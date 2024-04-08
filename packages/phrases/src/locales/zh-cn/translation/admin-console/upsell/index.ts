import featured_plan_content from './featured-plan-content.js';
import paywall from './paywall.js';

const upsell = {
  upgrade_plan: '升级计划',
  compare_plans: '比较计划',
  view_plans: '查看计划',
  create_tenant: {
    title: '选择您的租户计划',
    description:
      'Logto 提供创新且经济实惠的定价计划，旨在为不断发展的公司提供竞争优势。 <a>了解更多</a>',
    base_price: '基础价格',
    monthly_price: '每月 {{value, number}}',
    view_all_features: '查看所有功能',
    select_plan: '选择<name/>',
    free_tenants_limit: '最多{{count, number}}个免费租户',
    free_tenants_limit_other: '最多{{count, number}}个免费租户',
    most_popular: '最受欢迎',
    upgrade_success: '成功升级至<name/>',
  },
  mau_exceeded_modal: {
    title: 'MAU 超过限制，请升级您的计划。',
    notification:
      '您当前的 MAU 已超过<planName/>的限制。请立即升级到高级计划，以避免 Logto 服务的暂停。',
    update_plan: '更新计划',
  },
  payment_overdue_modal: {
    title: '账单逾期未付',
    notification:
      '糟糕！租户<span>{{name}}</span>的账单支付失败。请尽快支付账单，以避免Logto服务中止。',
    unpaid_bills: '未付账单',
    update_payment: '更新支付',
  },
  add_on_quota_item: {
    api_resource: 'API 资源',
    machine_to_machine: '机器对机器应用',
    tokens: '{{limit}}M 令牌',
    /** UNTRANSLATED */
    tenant_member: 'tenant member',
  },
  charge_notification_for_quota_limit:
    '您已超过{{item}}配额限制。Logto将为超出配额限制的使用添加费用。计费将从新的附加定价设计发布当天开始。 <a>了解更多</a>',
  paywall,
  featured_plan_content,
};

export default Object.freeze(upsell);
