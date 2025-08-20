const featured_plan_content = {
  mau: {
    free_plan: '最多{{count, number}} MAU',
    pro_plan: '無限 MAU',
  },
  m2m: {
    free_plan: '{{count, number}} 機器對機器',
    pro_plan: '額外的機器對機器',
  },
  saml_and_third_party_apps: 'SAML 應用程序和第三方應用程序',
  third_party_apps: '第三方應用的 IdP',
  mfa: '多因素認證',
  sso: '企業單點登錄',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} 角色和每個角色 {{permissionCount, number}} 權限',
    pro_plan: '無限角色和每個角色權限',
  },
  rbac: '基於角色的存取控制',
  organizations: '組織',
  audit_logs: '審計日誌保留：{{count, number}} 天',
};

export default Object.freeze(featured_plan_content);
