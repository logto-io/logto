const usage = {
  status_active: 'In use',
  status_inactive: 'Not in use',
  status_quota_description: '(First {{quota}} included)',
  unlimited_status_quota_description: '(Included)',
  unlimited_quota_description: '{{usage}} <span>(Unlimited included)</span>',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Pro Plan. <a>Learn more</a>',
    description_for_enterprise: '{{usage}}',
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: 'Organizations',
    description: '{{usage}}',
    tooltip:
      'Add-on feature with a flat rate of ${{price, number}} per month. Price is not affected by the number of organizations or their activity level.',
    description_for_enterprise: '(Included)',
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the organization feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of organizations or their activity.',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      'Add-on feature with a flat rate of ${{price, number}} per month. Price is not affected by the number of authentication factors used.',
    description_for_enterprise: '(Included)',
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: 'Enterprise SSO',
    description: '{{usage}}',
    tooltip: 'Add-on feature with a price of ${{price, number}} per SSO connection per month.',
    description_for_enterprise: '{{usage}} <span>(First {{quota}} included)</span>',
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first ${{quota, number}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'API resources',
    description: '{{usage}} <span>(First {{quota}} included)</span>',
    tooltip:
      'Add-on feature priced at ${{price, number}} per resource per month. The first 3 API resources are free.',
    description_for_enterprise: '{{usage}} <span>(First {{quota}} included)</span>',
    tooltip_for_enterprise:
      'The first ${{quota, number}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: 'Machine-to-machine',
    description: '{{usage}} <span>(First {{quota}} included)</span>',
    tooltip:
      'Add-on feature priced at ${{price, number}} per app per month. The first machine-to-machine app is free.',
    description_for_enterprise: '{{usage}} <span>(First {{quota}} included)</span>',
    tooltip_for_enterprise:
      'The first ${{quota, number}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: 'Tenant members',
    description: '{{usage}} <span>(First {{quota}} included)</span>',
    tooltip:
      'Add-on feature priced at ${{price, number}} per member per month. The first 3 tenant members are free.',
    description_for_enterprise: '{{usage}} <span>(First {{quota}} included)</span>',
    tooltip_for_enterprise:
      'The first ${{quota, number}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: 'Tokens',
    description: '{{usage}} <span>(First {{quota}}M included)</span>',
    tooltip:
      'Add-on feature priced at ${{price, number}} per million tokens. The first 1 million tokens is included.',
    description_for_enterprise: '{{usage}} <span>(First {{quota}}M included)</span>',
    tooltip_for_enterprise:
      'The first 1 million tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per million tokens per month.',
  },
  hooks: {
    title: 'Hooks',
    description: '{{usage}} <span>(First {{quota}} included)</span>',
    tooltip:
      'Add-on feature priced at ${{price, number}} per hook. The first 10 hooks are included.',
    description_for_enterprise: '{{usage}} <span>(First {{quota}} included)</span>',
    tooltip_for_enterprise:
      'The first ${{quota, number}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'If you make any changes during the current billing cycle, your next bill may be slightly higher for the first month after the change. It will be ${{price, number}} base price plus add-on costs for unbilled usage from the current cycle and the full charge for the next cycle. <a>Learn more</a>',
  },
};

export default Object.freeze(usage);
