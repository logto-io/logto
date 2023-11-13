import paywall from './paywall.js';

const upsell = {
  upgrade_plan: '升级计划',
  compare_plans: '比较计划',
  create_tenant: {
    title: '选择您的租户计划',
    description:
      'Logto 提供创新且经济实惠的定价计划，旨在为不断发展的公司提供竞争优势。 <a>了解更多</a>',
    base_price: '基础价格',
    monthly_price: '每月 {{value, number}}',
    mau_unit_price: 'MAU 单价',
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
  paywall,
};

export default Object.freeze(upsell);
