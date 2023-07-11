const quota_item = {
  tenant_limit: {
    name: '租户',
    limited: '{{count, number}} 个租户',
    limited_other: '{{count, number}} 个租户',
    unlimited: '无限制租户',
  },
  mau_limit: {
    name: '每月活跃用户',
    limited: '{{count, number}} 活跃用户',
    unlimited: '无限制活跃用户',
  },
  applications_limit: {
    name: '应用',
    limited: '{{count, number}} 个应用',
    limited_other: '{{count, number}} 个应用',
    unlimited: '无限制应用',
  },
  machine_to_machine_limit: {
    name: '机器到机器应用',
    limited: '{{count, number}} 个机器到机器应用',
    limited_other: '{{count, number}} 个机器到机器应用',
    unlimited: '无限制机器到机器应用',
  },
  resources_limit: {
    name: 'API 资源',
    limited: '{{count, number}} 个 API 资源',
    limited_other: '{{count, number}} 个 API 资源',
    unlimited: '无限制 API 资源',
  },
  scopes_per_resource_limit: {
    name: '资源权限',
    limited: '{{count, number}} 个权限',
    limited_other: '{{count, number}} 个权限',
    unlimited: '无限制权限',
  },
  custom_domain_enabled: {
    name: '自定义域名',
    limited: '自定义域名',
    unlimited: '自定义域名',
  },
  omni_sign_in_enabled: {
    name: '多平台登录',
    limited: '多平台登录',
    unlimited: '多平台登录',
  },
  built_in_email_connector_enabled: {
    name: '内建电子邮件连接器',
    limited: '内建电子邮件连接器',
    unlimited: '内建电子邮件连接器',
  },
  social_connectors_limit: {
    name: '社交连接器',
    limited: '{{count, number}} 个社交连接器',
    limited_other: '{{count, number}} 个社交连接器',
    unlimited: '无限制社交连接器',
  },
  standard_connectors_limit: {
    name: '免费标准连接器',
    limited: '{{count, number}} 个免费标准连接器',
    limited_other: '{{count, number}} 个免费标准连接器',
    unlimited: '无限制标准连接器',
  },
  roles_limit: {
    name: '角色',
    limited: '{{count, number}} 个角色',
    limited_other: '{{count, number}} 个角色',
    unlimited: '无限制角色',
  },
  scopes_per_role_limit: {
    name: '角色权限',
    limited: '{{count, number}} 个权限',
    limited_other: '{{count, number}} 个权限',
    unlimited: '无限制权限',
  },
  hooks_limit: {
    name: 'Hooks',
    limited: '{{count, number}} 个 Hook',
    limited_other: '{{count, number}} 个 Hook',
    unlimited: '无限制 Hooks',
  },
  audit_logs_retention_days: {
    name: '审计日志保留天数',
    limited: '审计日志保留：{{count, number}} 天',
    limited_other: '审计日志保留：{{count, number}} 天',
    unlimited: '无限制天',
  },
  community_support_enabled: {
    name: '社区支持',
    limited: '社区支持',
    unlimited: '社区支持',
  },
  customer_ticket_support: {
    name: '客户支持',
    limited: '{{count, number}} 小时客户支持',
    limited_other: '{{count, number}} 小时客户支持',
    unlimited: '客户支持',
  },
};

export default quota_item;
