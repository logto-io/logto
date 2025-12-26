const enterprise_subscription = {
  page_title: 'Subscription',
  title: 'Manage your subscription',
  subtitle: 'View and manage your multi-tenant subscription details and billing information.',
  tab: {
    subscription: 'Subscription',
    billing_history: 'Billing history',
  },
  subscription: {
    title: 'Subscription',
    description: 'Review your current subscription plan usage details and billing information.',
    enterprise_plan_title: 'Enterprise Plan',
    enterprise_plan_description:
      'This is your Enterprise plan subscription and this quota is shared across all tenants under your enterprise subscription.',
    add_on_title: 'Pay as you go add-ons',
    add_on_description:
      "These are additional pay-as-you-go add-ons based on your contract or Logto's standard pay-as-you-go rates. You will be charged according to your actual usage.",
    included: 'Included',
    over_quota: 'Over quota',
    basic_plan_column_title: {
      product: 'Product',
      usage: 'Usage',
      quota: 'Quota',
    },
    add_on_column_title: {
      product: 'Product',
      unit_price: 'Unit Price',
      quantity: 'Quantity',
      total_price: 'Total',
    },
    add_on_sku_price: '${{price}}/mo',
    private_region_title: 'Private cloud instance ({{regionName}})',
    shared_cross_tenants: 'Across tenants',
  },
};

export default Object.freeze(enterprise_subscription);
