const usage = {
  status_active: 'In use',
  status_inactive: 'Not in use',
  limited_status_quota_description: '(First {{quota}} included)',
  unlimited_status_quota_description: '(Included)',
  disabled_status_quota_description: '(Not included)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (Unlimited)</span>',
  usage_description_with_limited_quota: '{{usage}}<span> (First {{basicQuota}} included)</span>',
  usage_description_without_quota: '{{usage}}<span> (Not included)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Pro Plan. <a>Learn more</a>',
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: 'Organizations',
    tooltip:
      'Add-on feature with a flat rate of ${{price, number}} per month. Price is not affected by the number of organizations or their activity level.',
    description_for_enterprise: '(Included)',
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the organization feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of organizations or their activity.',
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Your plan includes the first {{basicQuota}} organizations for free. If you need more, you can add them with the organization add-on at a flat rate of ${{price, number}} per month, regardless of the number of organizations or their activity level.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Add-on feature with a flat rate of ${{price, number}} per month. Price is not affected by the number of authentication factors used.',
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: 'Enterprise SSO',
    tooltip: 'Add-on feature with a price of ${{price, number}} per SSO connection per month.',
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first {{basicQuota}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'API resources',
    tooltip:
      'Add-on feature priced at ${{price, number}} per resource per month. The first 3 API resources are free.',
    tooltip_for_enterprise:
      'The first {{basicQuota}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: 'Machine-to-machine',
    tooltip:
      'Add-on feature priced at ${{price, number}} per app per month. The first machine-to-machine app is free.',
    tooltip_for_enterprise:
      'The first {{basicQuota}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: 'Tenant members',
    tooltip:
      'Add-on feature priced at ${{price, number}} per member per month. The first {{count}} tenant member is free.',
    tooltip_one:
      'Add-on feature priced at ${{price, number}} per member per month. The first {{count}} tenant member is free.',
    tooltip_other:
      'Add-on feature priced at ${{price, number}} per member per month. The first {{count}} tenants member are free.',
    tooltip_for_enterprise:
      'The first {{count}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: 'Tokens',
    tooltip:
      'Add-on feature priced at ${{price, number}} per {{tokenLimit}} tokens. The first {{basicQuota}} tokens is included.',
    tooltip_for_enterprise:
      'The first {{basicQuota}} tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per {{tokenLimit}} tokens per month.',
  },
  hooks: {
    title: 'Hooks',
    tooltip:
      'Add-on feature priced at ${{price, number}} per hook. The first 10 hooks are included.',
    tooltip_for_enterprise:
      'The first {{basicQuota}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  security_features: {
    title: 'Advanced security',
    tooltip:
      'Add-on feature with a price of ${{price, number}}/month for the full advanced security bundle, including CAPTCHA, identifier lockout, email blocklist, and more.',
  },
  saml_applications: {
    title: 'SAML app',
    tooltip: 'Add-on feature priced at ${{price, number}} per SAML app per month. ',
  },
  third_party_applications: {
    title: 'Third-party app',
    tooltip: 'Add-on feature priced at ${{price, number}} per app per month.',
  },
  rbacEnabled: {
    title: 'Roles',
    tooltip:
      'Add-on feature with a flat rate of ${{price, number}} per month. Price is not affected by the number of global roles.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'If you make any changes during the current billing cycle, your next bill may be slightly higher for the first month after the change. It will be ${{price, number}} base price plus add-on costs for unbilled usage from the current cycle and the full charge for the next cycle. <a>Learn more</a>',
  },
};

export default Object.freeze(usage);
