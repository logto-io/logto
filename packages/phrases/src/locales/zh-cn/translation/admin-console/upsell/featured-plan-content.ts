const featured_plan_content = {
  mau: {
    free_plan: '最多 {{count, number}} MAU',
    pro_plan: '无限 MAU',
  },
  m2m: {
    free_plan: '{{count, number}} 机器对机器',
    pro_plan: '额外的机器对机器',
  },
  saml_and_third_party_apps: 'SAML 应用程序和第三方应用程序',
  third_party_apps: '第三方应用的 IdP',
  mfa: '多因素认证',
  sso: '企业单点登录',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} 角色和每个角色 {{permissionCount, number}} 权限',
    pro_plan: '无限角色和每个角色权限',
  },
  rbac: '基于角色的访问控制',
  organizations: '组织',
  audit_logs: '审计日志保留：{{count, number}} 天',
};

export default Object.freeze(featured_plan_content);
