const quota_item = {
  tenant_limit: {
    name: 'Tenants',
    limited: '{{count, number}} tenant',
    limited_other: '{{count, number}} tenants',
    unlimited: 'Unlimited tenants',
  },
  mau_limit: {
    name: 'Monthly active users',
    limited: '{{count, number}} MAU',
    unlimited: 'Unlimited MAU',
  },
  applications_limit: {
    name: 'Applications',
    limited: '{{count, number}} application',
    limited_other: '{{count, number}} applications',
    unlimited: 'Unlimited applications',
  },
  machine_to_machine_limit: {
    name: 'Machine to machine',
    limited: '{{count, number}} machine to machine app',
    limited_other: '{{count, number}} machine to machine apps',
    unlimited: 'Unlimited machine to machine apps',
  },
  resources_limit: {
    name: 'API resources',
    limited: '{{count, number}} API resource',
    limited_other: '{{count, number}} API resources',
    unlimited: 'Unlimited API resources',
  },
  scopes_per_resource_limit: {
    name: 'Resource permissions',
    limited: '{{count, number}} permission per resource',
    limited_other: '{{count, number}} permissions per resource',
    unlimited: 'Unlimited permission per resource',
  },
  custom_domain_enabled: {
    name: 'Custom domain',
    limited: 'Custom domain',
    unlimited: 'Custom domain',
  },
  omni_sign_in_enabled: {
    name: 'Omni sign-in',
    limited: 'Omni sign-in',
    unlimited: 'Omni sign-in',
  },
  built_in_email_connector_enabled: {
    name: 'Built-in email connector',
    limited: 'Built-in email connector',
    unlimited: 'Built-in email connector',
  },
  social_connectors_limit: {
    name: 'Social connectors',
    limited: '{{count, number}} social connector',
    limited_other: '{{count, number}} social connectors',
    unlimited: 'Unlimited Social connectors',
  },
  standard_connectors_limit: {
    name: 'Free standard connectors',
    limited: '{{count, number}} free standard connector',
    limited_other: '{{count, number}} free standard connectors',
    unlimited: 'Unlimited standard connectors',
  },
  roles_limit: {
    name: 'Roles',
    limited: '{{count, number}} role',
    limited_other: '{{count, number}} roles',
    unlimited: 'Unlimited roles',
  },
  scopes_per_role_limit: {
    name: 'Role permissions',
    limited: '{{count, number}} permission per role',
    limited_other: '{{count, number}} permissions per role',
    unlimited: 'Unlimited permission per role',
  },
  hooks_limit: {
    name: 'Hooks',
    limited: '{{count, number}} hook',
    limited_other: '{{count, number}} hooks',
    unlimited: 'Unlimited hooks',
  },
  audit_logs_retention_days: {
    name: 'Audit logs retention',
    limited: 'Audit logs retention: {{count, number}} day',
    limited_other: 'Audit logs retention: {{count, number}} days',
    unlimited: 'Unlimited days',
  },
  community_support_enabled: {
    name: 'Community support',
    limited: 'Community support',
    unlimited: 'Community support',
  },
  customer_ticket_support: {
    name: 'Customer ticket support',
    limited: '{{count, number}} hour customer ticket support',
    limited_other: '{{count, number}} hours customer ticket support',
    unlimited: 'Customer ticket support',
  },
};

export default quota_item;
