const subscription = {
  free_plan: 'Free Plan',
  free_plan_description: 'For side projects and initial Logto trials. No credit card.',
  hobby_plan: 'Hobby Plan',
  hobby_plan_description: 'For individual developers or development environments.',
  pro_plan: 'Pro Plan',
  pro_plan_description: 'For businesses benefit worry-free with Logto.',
  enterprise: 'Enterprise',
  current_plan: 'Current Plan',
  current_plan_description:
    'This is your current plan. You can view the plan usage, your next bill and upgrade to a higher tier plan if you like.',
  plan_usage: 'Plan usage',
  plan_cycle: 'Plan cycle: {{period}}. Usage renews on {{renewDate}}.',
  next_bill: 'Your next bill',
  next_bill_hint: 'To learn more about the calculation, please refer to this <a>article</a>.',
  next_bill_tip:
    'Your upcoming bill includes the base price of your plan for the next month, as well as the cost of your usage multiplied by the MAU unit price in various tiers.',
  manage_payment: 'Manage payment',
  overfill_quota_warning:
    'You have reached your quota limit. To prevent any issues, upgrade the plan.',
  upgrade_pro: 'Upgrade Pro',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Payment issue detected. Unable to process ${{price, number}} for previous cycle. Update payment to avoid Logto service suspension.',
  downgrade: 'Downgrade',
  current: 'Current',
  buy_now: 'Buy now',
  contact_us: 'Contact us',
  quota_table: {
    quota: {
      title: 'Quota',
      tenant_limit: 'Tenant limit',
      base_price: 'Base price',
      mau_unit_price: '* MAU unit price',
      mau_limit: 'MAU limit',
    },
    application: {
      title: 'Applications',
      total: 'Total',
      m2m: 'Machine to machine',
    },
    resource: {
      title: 'API resources',
      resource_count: 'Resource count',
      scopes_per_resource: 'Permission per resource',
    },
    branding: {
      title: 'Branding',
      custom_domain: 'Custom Domain',
    },
    user_authn: {
      title: 'User authentication',
      omni_sign_in: 'Omni sign-in',
      built_in_email_connector: 'Built-in email connector',
      social_connectors: 'Social connectors',
      standard_connectors: 'Standard connectors',
    },
    roles: {
      title: 'Roles',
      roles: 'Roles',
      scopes_per_role: 'Permission per role',
    },
    audit_logs: {
      title: 'Audit logs',
      retention: 'Retention',
    },
    hooks: {
      title: 'Hooks',
      amount: 'Amount',
    },
    support: {
      title: 'Support',
      community: 'Community',
      customer_ticket: 'Customer ticket',
      premium: 'Premium',
    },
    mau_unit_price_footnote:
      '* Our unit prices may vary based on the actual resources consumed, and Logto reserves the right to explain any changes in unit prices.',
    unlimited: 'Unlimited',
    contact: 'Contact',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '${{value, number}}/mo',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '${{value, number}}/MAU',
    days_one: '{{count, number}} day',
    days_other: '{{count, number}} days',
    add_on: 'Add-on',
  },
  downgrade_form: {
    allowed_title: 'Are you sure you want to downgrade?',
    allowed_description:
      'By downgrading to the {{plan}}, you will no longer have access to the following benefits.',
    not_allowed_title: 'You are not eligible for downgrade',
    not_allowed_description:
      'Make sure you meet the following standards before downgrading to the {{plan}}. Once you have reconciled and fulfilled the requirements, you will be eligible for the downgrade.',
    confirm_downgrade: 'Downgrade anyway',
  },
};

export default subscription;
