const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: 'Upgrade plan',
  compare_plans: 'Compare plans',
  contact_us: 'Contact Us',
  get_started: {
    title: 'Begin your seamless identity journey with a <planName/>!',
    description:
      '<planName/> is perfect for trying out Logto on your side projects or trials. To fully leverage Logto’s capabilities for your team, upgrade to gain unlimited access to premium features: unlimited MAU usage, Machine-to-Machine integration, seamless RBAC management, long-term audit logs, and more.',
    view_plans: 'View Plans',
  },
  create_tenant: {
    title: 'Select your tenant plan',
    description:
      'Logto provides competitive plan options with innovative and affordable pricing designed for growing companies. <a>Learn more</a>',
    base_price: 'Base price',
    monthly_price: '{{value, number}}/mo',
    mau_unit_price: 'MAU unit price',
    view_all_features: 'View all features',
    select_plan: 'Select <name/>',
    upgrade_to: 'Upgrade to <name/>',
    free_tenants_limit: 'Up to {{count, number}} free tenant',
    free_tenants_limit_other: 'Up to {{count, number}} free tenants',
    most_popular: 'Most popular',
    upgrade_success: 'Successfully upgraded to <name/>',
  },
  paywall: {
    applications:
      '{{count, number}} application of <planName/> limit reached. Upgrade plan to meet your team’s needs. For any assistance, feel free to <a>contact us</a>.',
    applications_other:
      '{{count, number}} applications of <planName/> limit reached. Upgrade plan to meet your team’s needs. For any assistance, feel free to <a>contact us</a>.',
    machine_to_machine_feature:
      'Upgrade to a paid plan to create machine-to-machine application, along with access to all the premium features. For any assistance, feel free to <a>contact us</a>.',
    machine_to_machine:
      '{{count, number}} machine-to-machine application of <planName/> limit reached. Upgrade plan to meet your team’s needs. For any assistance, feel free to <a>contact us</a>.',
    machine_to_machine_other:
      '{{count, number}} machine-to-machine applications of <planName/> limit reached. Upgrade plan to meet your team’s needs. For any assistance, feel free to <a>contact us</a>.',
    resources:
      '{{count, number}} API resource of <planName/> limit reached. Upgrade plan to meet your team’s needs. <a>Contact us</a> for any assistant.',
    resources_other:
      '{{count, number}} API resources of <planName/> limit reached. Upgrade plan to meet your team’s needs. <a>Contact us</a> for any assistant.',
    scopes_per_resource:
      '{{count, number}} permission per API resource of <planName/> limit reached. Upgrade now to expand. <a>Contact us</a> for any assistant.',
    scopes_per_resource_other:
      '{{count, number}} permissions per API resource of <planName/> limit reached. Upgrade now to expand. <a>Contact us</a> for any assistant.',
    custom_domain:
      'Unlock custom domain functionality and a range of premium benefits by upgrading to a paid plan. Don’t hesitate to <a>contact us</a> if you need any assistance.',
    social_connectors:
      '{{count, number}} social connector of <planName/> limit reached. To meet your team’s needs, upgrade plan for additional social connectors and the ability to create your own connectors using OIDC, OAuth 2.0, and SAML protocols. Feel free to <a>contact us</a> if you need any assistance.',
    social_connectors_other:
      '{{count, number}} social connectors of <planName/> limit reached. To meet your team’s needs, upgrade plan for additional social connectors and the ability to create your own connectors using OIDC, OAuth 2.0, and SAML protocols. Feel free to <a>contact us</a> if you need any assistance.',
    standard_connectors_feature:
      'Upgrade to a paid plan to create your own connectors using OIDC, OAuth 2.0, and SAML protocols, plus unlimited social connectors and all the premium features. Feel free to <a>contact us</a> if you need any assistance.',
    standard_connectors:
      '{{count, number}} social connector of <planName/> limit reached. To meet your team’s needs, upgrade plan for additional social connectors and the ability to create your own connectors using OIDC, OAuth 2.0, and SAML protocols. Feel free to <a>contact us</a> if you need any assistance.',
    standard_connectors_other:
      '{{count, number}} social connectors of <planName/> limit reached. To meet your team’s needs, upgrade plan for additional social connectors and the ability to create your own connectors using OIDC, OAuth 2.0, and SAML protocols. Feel free to <a>contact us</a> if you need any assistance.',
    standard_connectors_pro:
      '{{count, number}} standard connector of <planName/> limit reached. To meet your team’s needs, upgrade to the Enterprise plan for additional social connectors and the ability to create your own connectors using OIDC, OAuth 2.0, and SAML protocols. Feel free to <a>contact us</a> if you need any assistance.',
    standard_connectors_pro_other:
      '{{count, number}} standard connectors of <planName/> limit reached. To meet your team’s needs, upgrade to the Enterprise plan for additional social connectors and the ability to create your own connectors using OIDC, OAuth 2.0, and SAML protocols. Feel free to <a>contact us</a> if you need any assistance.',
    roles:
      '{{count, number}} role of <planName/> limit reached. Upgrade plan to add additional roles and permissions. Feel free to <a>contact us</a> if you need any assistance.',
    roles_other:
      '{{count, number}} roles of <planName/> limit reached. Upgrade plan to add additional roles and permissions. Feel free to <a>contact us</a> if you need any assistance.',
    scopes_per_role:
      '{{count, number}} permission per role of <planName/> limit reached. Upgrade plan to add additional roles and permissions. For any assistance, feel free to <a>contact us</a>.',
    scopes_per_role_other:
      '{{count, number}} permissions per role of <planName/> limit reached. Upgrade plan to add additional roles and permissions. For any assistance, feel free to <a>contact us</a>.',
    hooks:
      '{{count, number}} webhook of <planName/> limit reached. Upgrade plan to create more webhooks. Feel free to <a>contact us</a> if you need any assistance.',
    hooks_other:
      '{{count, number}} webhooks of <planName/> limit reached. Upgrade plan to create more webhooks. Feel free to <a>contact us</a> if you need any assistance.',
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
};

export default upsell;
