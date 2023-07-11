const quota_item = {
  tenant_limit: {
    name: '租戶',
    limited: '{{count, number}} 租戶',
    limited_other: '{{count, number}} 租戶',
    unlimited: '無限制租戶',
  },
  mau_limit: {
    name: '每月活躍用戶數',
    limited: '{{count, number}} 活躍用戶數',
    unlimited: '無限制活躍用戶數',
  },
  applications_limit: {
    name: '應用程序',
    limited: '{{count, number}} 應用程序',
    limited_other: '{{count, number}} 應用程序',
    unlimited: '無限制應用程序',
  },
  machine_to_machine_limit: {
    name: '主機到主機',
    limited: '{{count, number}} 主機到主機應用程序',
    limited_other: '{{count, number}} 主機到主機應用程序',
    unlimited: '無限制主機到主機應用程序',
  },
  resources_limit: {
    name: 'API 資源',
    limited: '{{count, number}} API 資源',
    limited_other: '{{count, number}} API 資源',
    unlimited: '無限制 API 資源',
  },
  scopes_per_resource_limit: {
    name: '資源權限',
    limited: '{{count, number}} 資源權限',
    limited_other: '{{count, number}} 資源權限',
    unlimited: '無限制資源權限',
  },
  custom_domain_enabled: {
    name: '自訂網域',
    limited: '自訂網域',
    unlimited: '自訂網域',
  },
  omni_sign_in_enabled: {
    name: 'Omni sign-in',
    limited: 'Omni sign-in',
    unlimited: 'Omni sign-in',
  },
  built_in_email_connector_enabled: {
    name: '內建郵件連接器',
    limited: '內建郵件連接器',
    unlimited: '內建郵件連接器',
  },
  social_connectors_limit: {
    name: '社交連接器',
    limited: '{{count, number}} 社交連接器',
    limited_other: '{{count, number}} 社交連接器',
    unlimited: '無限制社交連接器',
  },
  standard_connectors_limit: {
    name: '免費標準連接器',
    limited: '{{count, number}} 免費標準連接器',
    limited_other: '{{count, number}} 免費標準連接器',
    unlimited: '無限制標準連接器',
  },
  roles_limit: {
    name: '角色',
    limited: '{{count, number}} 角色',
    limited_other: '{{count, number}} 角色',
    unlimited: '無限制角色',
  },
  scopes_per_role_limit: {
    name: '角色權限',
    limited: '{{count, number}} 角色權限',
    limited_other: '{{count, number}} 角色權限',
    unlimited: '無限制角色權限',
  },
  hooks_limit: {
    name: 'Hooks',
    limited: '{{count, number}} Hooks',
    limited_other: '{{count, number}} Hooks',
    unlimited: '無限制 Hooks',
  },
  audit_logs_retention_days: {
    name: '稽核日誌保留天數',
    limited: '稽核日誌保留：{{count, number}} 天',
    limited_other: '稽核日誌保留：{{count, number}} 天',
    unlimited: '無限制天數',
  },
  community_support_enabled: {
    name: '社區支援',
    limited: '社區支援',
    unlimited: '社區支援',
  },
  customer_ticket_support: {
    name: '客戶支援',
    limited: '{{count, number}} 小時客戶支援',
    limited_other: '{{count, number}} 小時客戶支援',
    unlimited: '客戶支援',
  },
};

export default quota_item;
