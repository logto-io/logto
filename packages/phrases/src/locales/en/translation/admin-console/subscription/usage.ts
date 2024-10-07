const usage = {
  status_active: 'On',
  status_inactive: 'Off',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Pro Plan. <a>Learn more</a>',
  },
  organizations: {
    title: 'Organizations',
    description: '{{usage}}',
    tooltip:
      'Add-on feature with a flat rate of ${{price, number}} per month. Price is not affected by the number of organizations or their activity level.',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      'Add-on feature with a flat rate of ${{price, number}} per month. Price is not affected by the number of authentication factors used.',
  },
  enterprise_sso: {
    title: 'Enterprise SSO',
    description: '{{usage}}',
    tooltip: 'Add-on feature with a price of ${{price, number}} per SSO connection per month.',
  },
  api_resources: {
    title: 'API resources',
    description: '{{usage}} <span>(Free for the first 3)</span>',
    tooltip:
      'Add-on feature priced at ${{price, number}} per resource per month. The first 3 API resources are free.',
  },
  machine_to_machine: {
    title: 'Machine-to-machine',
    description: '{{usage}} <span>(Free for the first 1)</span>',
    tooltip:
      'Add-on feature priced at ${{price, number}} per app per month. The first machine-to-machine app is free.',
  },
  tenant_members: {
    title: 'Tenant members',
    description: '{{usage}} <span>(Free for the first 3)</span>',
    tooltip:
      'Add-on feature priced at ${{price, number}} per member per month. The first 3 tenant members are free.',
  },
  tokens: {
    title: 'Tokens',
    description: '{{usage}}',
    tooltip:
      'Add-on feature priced at ${{price, number}} per million tokens. The first 1 million tokens is included.',
  },
  hooks: {
    title: 'Hooks',
    description: '{{usage}} <span>(Free for the first 10)</span>',
    tooltip:
      'Add-on feature priced at ${{price, number}} per hook. The first 10 hooks are included.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'If you make any changes during the current billing cycle, your next bill may be slightly higher for the first month after the change. It will be ${{price, number}} base price plus add-on costs for unbilled usage from the current cycle and the full charge for the next cycle. <a>Learn more</a>',
  },
};

export default Object.freeze(usage);
