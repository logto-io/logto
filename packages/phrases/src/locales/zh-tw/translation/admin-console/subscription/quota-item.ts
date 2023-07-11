const quota_item = {
  tenant_limit: {
    name: 'Tenants',
    limited: '{{count, number}} 客戶',
    limited_other: '{{count, number}} 客戶',
    unlimited: '無限制的客戶',
  },
  mau_limit: {
    name: 'Monthly active users',
    limited: '{{count, number}} MAU',
    unlimited: '無限制的 MAU',
  },
  applications_limit: {
    name: 'Applications',
    limited: '{{count, number}} 應用程式',
    limited_other: '{{count, number}} 應用程式',
    unlimited: '無限制的應用程式',
  },
  machine_to_machine_limit: {
    name: 'Machine to machine',
    limited: '{{count, number}} 機器到機器應用程式',
    limited_other: '{{count, number}} 機器到機器應用程式',
    unlimited: '無限制的機器到機器應用程式',
  },
  resources_limit: {
    name: 'API resources',
    limited: '{{count, number}} API 資源',
    limited_other: '{{count, number}} API 資源',
    unlimited: '無限制的 API 資源',
  },
  scopes_per_resource_limit: {
    name: 'Resource permissions',
    limited: '{{count, number}} 權限每資源',
    limited_other: '{{count, number}} 權限每資源',
    unlimited: '無限制的權限每資源',
  },
  custom_domain_enabled: {
    name: 'Custom domain',
    limited: '自訂網域',
    unlimited: '自訂網域',
  },
  omni_sign_in_enabled: {
    name: 'Omni sign-in',
    limited: 'Omni 登入',
    unlimited: 'Omni 登入',
  },
  built_in_email_connector_enabled: {
    name: 'Built-in email connector',
    limited: '內建電子郵件連接器',
    unlimited: '內建電子郵件連接器',
  },
  social_connectors_limit: {
    name: 'Social connectors',
    limited: '{{count, number}} 社群連接器',
    limited_other: '{{count, number}} 社群連接器',
    unlimited: '無限制的社群連接器',
  },
  standard_connectors_limit: {
    name: 'Free standard connectors',
    limited: '{{count, number}} 免費標準連接器',
    limited_other: '{{count, number}} 免費標準連接器',
    unlimited: '無限制的標準連接器',
  },
  roles_limit: {
    name: 'Roles',
    limited: '{{count, number}} 角色',
    limited_other: '{{count, number}} 角色',
    unlimited: '無限制的角色',
  },
  scopes_per_role_limit: {
    name: 'Role permissions',
    limited: '{{count, number}} 權限每角色',
    limited_other: '{{count, number}} 權限每角色',
    unlimited: '無限制的權限每角色',
  },
  hooks_limit: {
    name: 'Hooks',
    limited: '{{count, number}} Hook',
    limited_other: '{{count, number}} Hook',
    unlimited: '無限制的 Hook',
  },
  audit_logs_retention_days: {
    name: 'Audit logs retention',
    limited: '存儲時間：{{count, number}} 天',
    limited_other: '存儲時間：{{count, number}} 天',
    unlimited: '無限制的天數',
  },
  community_support_enabled: {
    name: 'Community support',
    limited: '社群支援',
    unlimited: '社群支援',
  },
  customer_ticket_support: {
    name: 'Customer ticket support',
    limited: '{{count, number}} 小時客戶票務支援',
    limited_other: '{{count, number}} 小時客戶票務支援',
    unlimited: '客戶票務支援',
  },
};

export default quota_item;
