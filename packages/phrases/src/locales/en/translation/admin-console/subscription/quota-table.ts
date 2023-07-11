const quota_table = {
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
};

export default quota_table;
