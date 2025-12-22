const featured_plan_content = {
  mau: {
    free_plan: 'Up to {{count, number}} MAU',
    pro_plan: 'Unlimited MAU',
  },
  m2m: {
    free_plan: '{{count, number}} machine-to-machine',
    pro_plan: 'Additional machine-to-machine',
  },
  saml_and_third_party_apps: 'SAML apps & third-party apps',
  third_party_apps: 'IdP for third-party applications',
  mfa: 'Multi-factor authentication',
  sso: 'Enterprise SSO',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} role and {{permissionCount, number}} permission per role',
    pro_plan: 'Unlimited roles and permissions per role',
  },
  rbac: 'Role-based access control',
  organizations: 'Organizations',
  audit_logs: 'Audit logs retention: {{count, number}} days',
};

export default Object.freeze(featured_plan_content);
