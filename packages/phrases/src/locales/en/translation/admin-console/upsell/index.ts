import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'Upgrade plan',
  compare_plans: 'Compare plans',
  create_tenant: {
    title: 'Select your tenant plan',
    description:
      'Logto provides competitive plan options with innovative and affordable pricing designed for growing companies. <a>Learn more</a>',
    base_price: 'Base price',
    monthly_price: '{{value, number}}/mo',
    mau_unit_price: 'MAU unit price',
    view_all_features: 'View all features',
    select_plan: 'Select <name/>',
    free_tenants_limit: 'Up to {{count, number}} free tenant',
    free_tenants_limit_other: 'Up to {{count, number}} free tenants',
    most_popular: 'Most popular',
    upgrade_success: 'Successfully upgraded to <name/>',
  },
  mau_exceeded_modal: {
    title: 'MAU has exceeded the limit. Upgrade your plan.',
    notification:
      'Your current MAU has exceeded the limit of <planName/>. Please upgrade your plan to premium promptly to avoid suspension of Logto service. ',
    update_plan: 'Update Plan',
  },
  payment_overdue_modal: {
    title: 'Bill payment overdue',
    notification:
      'Oops! Payment for tenant <span>{{name}}</span> bill failed. Please pay the bill promptly to avoid suspension of Logto service.',
    unpaid_bills: 'Unpaid bills',
    update_payment: 'Update Payment',
  },
  paywall,
};

export default Object.freeze(upsell);
