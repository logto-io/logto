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
    price: 'Price',
    billing_period: 'Billing period',
    list_price_note:
      'Prices exclude taxes and discounts. Changes are prorated on your next invoice.',
    overdue_note:
      'Payment is overdue. If it remains unpaid, the subscription may be paused and its paid features removed.',
    cancel_on: 'Cancellation scheduled for {{date}}',
    other_product: 'Other subscription',
    enterprise_invoices_description:
      'Invoices for your Enterprise contract. Select an invoice to view it and download the invoice or receipt.',
    personal_invoices_description:
      'Invoices for subscriptions billed to your account, including past subscriptions. Select an invoice to view it and download the invoice or receipt.',
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
