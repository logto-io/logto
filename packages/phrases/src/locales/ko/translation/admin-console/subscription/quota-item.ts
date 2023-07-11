const quota_item = {
  tenant_limit: {
    name: '테넌트',
    limited: '{{count, number}} 테넌트',
    limited_other: '{{count, number}} 테넌트들',
    unlimited: '무제한 테넌트',
  },
  mau_limit: {
    name: 'Monthly active users',
    limited: '{{count, number}} MAU',
    unlimited: '무제한 MAU',
  },
  applications_limit: {
    name: '애플리케이션',
    limited: '{{count, number}} 애플리케이션',
    limited_other: '{{count, number}} 애플리케이션들',
    unlimited: '무제한 애플리케이션',
  },
  machine_to_machine_limit: {
    name: 'Machine to machine',
    limited: '{{count, number}} machine to machine 앱',
    limited_other: '{{count, number}} machine to machine 앱들',
    unlimited: '무제한 machine to machine 앱들',
  },
  resources_limit: {
    name: 'API 리소스',
    limited: '{{count, number}} API 리소스',
    limited_other: '{{count, number}} API 리소스들',
    unlimited: '무제한 API 리소스',
  },
  scopes_per_resource_limit: {
    name: 'Resource permissions',
    limited: '{{count, number}} 리소스 당 권한',
    limited_other: '{{count, number}} 리소스 당 권한들',
    unlimited: '무제한 리소스 당 권한',
  },
  custom_domain_enabled: {
    name: '커스텀 도메인',
    limited: '커스텀 도메인',
    unlimited: '커스텀 도메인',
  },
  omni_sign_in_enabled: {
    name: 'Omni sign-in',
    limited: 'Omni sign-in',
    unlimited: 'Omni sign-in',
  },
  built_in_email_connector_enabled: {
    name: '내장 이메일 커넥터',
    limited: '내장 이메일 커넥터',
    unlimited: '내장 이메일 커넥터',
  },
  social_connectors_limit: {
    name: '소셜 커넥터',
    limited: '{{count, number}} 소셜 커넥터',
    limited_other: '{{count, number}} 소셜 커넥터들',
    unlimited: '무제한 소셜 커넥터',
  },
  standard_connectors_limit: {
    name: 'Free standard connectors',
    limited: '{{count, number}} 무료 표준 커넥터',
    limited_other: '{{count, number}} 무료 표준 커넥터들',
    unlimited: '무제한 표준 커넥터',
  },
  roles_limit: {
    name: 'Roles',
    limited: '{{count, number}} 롤',
    limited_other: '{{count, number}} 롤들',
    unlimited: '무제한 롤',
  },
  scopes_per_role_limit: {
    name: 'Role permissions',
    limited: '{{count, number}} 롤 당 권한',
    limited_other: '{{count, number}} 롤 당 권한들',
    unlimited: '무제한 롤 당 권한',
  },
  hooks_limit: {
    name: 'Hooks',
    limited: '{{count, number}} 후크',
    limited_other: '{{count, number}} 후크들',
    unlimited: '무제한 후크',
  },
  audit_logs_retention_days: {
    name: 'Audit logs retention',
    limited: 'Audit logs retention: {{count, number}} 일',
    limited_other: 'Audit logs retention: {{count, number}} 일들',
    unlimited: '무제한일',
  },
  community_support_enabled: {
    name: '커뮤니티 지원',
    limited: '커뮤니티 지원',
    unlimited: '커뮤니티 지원',
  },
  customer_ticket_support: {
    name: 'Customer ticket support',
    limited: '{{count, number}} 시간 고객 티켓 지원',
    limited_other: '{{count, number}} 시간 고객 티켓 지원',
    unlimited: '고객 티켓 지원',
  },
};

export default quota_item;
