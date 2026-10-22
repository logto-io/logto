const enterprise_subscription = {
  page_title: 'Subscription',
  title: 'Manage your subscription',
  subtitle: 'This is to manage your multi-tenant subscription and billing history',
  tab: {
    subscription: 'Subscription',
    billing_history: 'Billing history',
  },
  subscription: {
    title: 'Subscription',
    description: 'Easily track your usage, see your next bill, and review your original contract.',
    enterprise_plan_title: 'Enterprise Plan',
    enterprise_plan_description:
      'This is your Enterprise plan subscription and this quota is shared across tenants. Usage may be subject to a slight delay in updates. ',
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
  user_subscriptions: {
    description:
      'View your personal subscriptions and contracted Enterprise coverage, independently of your selected tenant.',
    personal_title: 'Personal subscriptions',
    personal_description: 'Subscriptions billed to your account, including past subscriptions.',
    enterprise_description:
      'Console SSO allowance is defined by your contract and shared across authorized managers. Personal subscriptions are billed separately.',
    allowance: 'Contract allowance',
    not_covered:
      "This Enterprise plan doesn't include a Console SSO allowance. New connectors are billed to a personal subscription.",
    quantity_price: 'Quantity × unit price',
    billing_period: 'Billing period',
    connectors: 'Console SSO connectors',
    no_connectors: 'No connectors',
    list_price_note:
      'The displayed quantity, unit price and status come from the subscription record. Pausing collection may leave the quantity and status unchanged. Unit prices exclude taxes, discounts and prorations and do not represent current charges or an amount due.',
    proration_note:
      'Console SSO additions and removals are prorated on the regular invoice. Deleting the last paid connector cancels and settles the subscription.',
    overdue_note:
      'After three consecutive unpaid billing cycles and exhausted retries, collection is paused and paid Console SSO connectors are removed. Updating payment does not restore their configuration. Contact us for help.',
    cancel_on: 'Cancellation scheduled for {{date}}',
    other_product: 'Other subscription',
    billing_history_title: 'Billing history',
    billing_history_description:
      'Invoices for your personal subscriptions and your Enterprise contract. Select an invoice to view it and download the invoice or receipt.',
    credit_note:
      'Credits from removals or prorations reduce later invoices and are not necessarily refunded to your payment method right away.',
    invoice_link_unavailable: 'This invoice page is unavailable. Contact us if you need a copy.',
    status: {
      active: 'Active',
      trialing: 'Trialing',
      past_due: 'Past due',
      unpaid: 'Unpaid',
      canceled: 'Canceled',
      incomplete: 'Incomplete',
      incomplete_expired: 'Expired',
      paused: 'Paused',
    },
  },
};

export default Object.freeze(enterprise_subscription);
