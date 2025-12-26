const enterprise_subscription = {
  /** UNTRANSLATED */
  page_title: 'Subscription',
  /** UNTRANSLATED */
  title: 'Manage your subscription',
  /** UNTRANSLATED */
  subtitle: 'View and manage your multi-tenant subscription details and billing information.',
  tab: {
    /** UNTRANSLATED */
    subscription: 'Subscription',
    /** UNTRANSLATED */
    billing_history: 'Billing history',
  },
  subscription: {
    /** UNTRANSLATED */
    title: 'Subscription',
    /** UNTRANSLATED */
    description: 'Review your current subscription plan usage details and billing information.',
    /** UNTRANSLATED */
    enterprise_plan_title: 'Enterprise Plan',
    /** UNTRANSLATED */
    enterprise_plan_description:
      'This is your Enterprise plan subscription and this quota is shared across all tenants under your enterprise subscription.',
    /** UNTRANSLATED */
    add_on_title: 'Pay as you go add-ons',
    /** UNTRANSLATED */
    add_on_description:
      "These are additional pay-as-you-go add-ons based on your contract or Logto's standard pay-as-you-go rates. You will be charged according to your actual usage.",
    /** UNTRANSLATED */
    included: 'Included',
    /** UNTRANSLATED */
    over_quota: 'Over quota',
    basic_plan_column_title: {
      /** UNTRANSLATED */
      product: 'Product',
      /** UNTRANSLATED */
      usage: 'Usage',
      /** UNTRANSLATED */
      quota: 'Quota',
    },
    add_on_column_title: {
      /** UNTRANSLATED */
      product: 'Product',
      /** UNTRANSLATED */
      unit_price: 'Unit Price',
      /** UNTRANSLATED */
      quantity: 'Quantity',
      /** UNTRANSLATED */
      total_price: 'Total',
    },
    /** UNTRANSLATED */
    add_on_sku_price: '${{price}}/mo',
    /** UNTRANSLATED */
    private_region_title: 'Private cloud instance ({{regionName}})',
    /** UNTRANSLATED */
    shared_cross_tenants: 'Across tenants',
  },
};

export default Object.freeze(enterprise_subscription);
