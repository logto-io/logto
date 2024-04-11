const quota_item = {
  tenant_limit: {
    name: '성주',
    limited: '{{count, number}} 성주',
    limited_other: '{{count, number}} 성주',
    unlimited: '제한 없는 성주',
    not_eligible: '성주를 제거하십시오',
  },
  mau_limit: {
    name: '월간 활성 사용자',
    limited: '{{count, number}} 월간 활성 사용자',
    unlimited: '제한 없는 월간 활성 사용자',
    not_eligible: '모든 사용자를 제거하십시오',
  },
  token_limit: {
    name: '토큰',
    limited: '{{count, number}} 토큰',
    limited_other: '{{count, number}} 토큰',
    unlimited: '제한 없는 토큰',
    not_eligible: '새로운 토큰을 방지하려면 모든 사용자를 제거하십시오',
  },
  applications_limit: {
    name: '애플리케이션',
    limited: '{{count, number}} 애플리케이션',
    limited_other: '{{count, number}} 애플리케이션',
    unlimited: '제한 없는 애플리케이션',
    not_eligible: '애플리케이션을 제거하십시오',
  },
  machine_to_machine_limit: {
    name: '기계 간 통신',
    limited: '{{count, number}} 기계 간 앱',
    limited_other: '{{count, number}} 기계 간 앱',
    unlimited: '제한 없는 기계 간 앱',
    not_eligible: '기계 간 앱을 제거하십시오',
  },
  third_party_applications_limit: {
    /** UNTRANSLATED */
    name: 'Third-party apps',
    /** UNTRANSLATED */
    limited: '{{count, number}} third-party app',
    /** UNTRANSLATED */
    limited_other: '{{count, number}} third-party apps',
    /** UNTRANSLATED */
    unlimited: 'Unlimited third-party apps',
    /** UNTRANSLATED */
    not_eligible: 'Remove your third-party apps',
  },
  resources_limit: {
    name: 'API 리소스',
    limited: '{{count, number}} API 리소스',
    limited_other: '{{count, number}} API 리소스',
    unlimited: '제한 없는 API 리소스',
    not_eligible: 'API 리소스를 제거하십시오',
  },
  scopes_per_resource_limit: {
    name: '리소스 권한',
    limited: '{{count, number}} 리소스당 권한',
    limited_other: '{{count, number}} 리소스당 권한',
    unlimited: '제한 없는 리소스당 권한',
    not_eligible: '리소스 권한을 제거하십시오',
  },
  custom_domain_enabled: {
    name: '사용자 정의 도메인',
    limited: '사용자 정의 도메인',
    unlimited: '사용자 정의 도메인',
    not_eligible: '사용자 정의 도메인을 제거하십시오',
  },
  omni_sign_in_enabled: {
    name: 'Omin 사인인',
    limited: 'Omin 사인인',
    unlimited: 'Omin 사인인',
    not_eligible: 'Omin 사인인을 비활성화하세요',
  },
  built_in_email_connector_enabled: {
    name: '내장된 이메일 커넥터',
    limited: '내장된 이메일 커넥터',
    unlimited: '내장된 이메일 커넥터',
    not_eligible: '내장된 이메일 커넥터를 제거하십시오',
  },
  social_connectors_limit: {
    name: '소셜 커넥터',
    limited: '{{count, number}} 소셜 커넥터',
    limited_other: '{{count, number}} 소셜 커넥터',
    unlimited: '제한 없는 소셜 커넥터',
    not_eligible: '소셜 커넥터를 제거하십시오',
  },
  standard_connectors_limit: {
    name: '무료 표준 커넥터',
    limited: '{{count, number}} 무료 표준 커넥터',
    limited_other: '{{count, number}} 무료 표준 커넥터',
    unlimited: '제한 없는 표준 커넥터',
    not_eligible: '표준 커넥터를 제거하십시오',
  },
  roles_limit: {
    name: '역할',
    limited: '{{count, number}} 역할',
    limited_other: '{{count, number}} 역할',
    unlimited: '제한 없는 역할',
    not_eligible: '역할을 제거하십시오',
  },
  machine_to_machine_roles_limit: {
    name: '기계 간 역할',
    limited: '{{count, number}} 기계 간 역할',
    limited_other: '{{count, number}} 기계 간 역할',
    unlimited: '제한 없는 기계 간 역할',
    not_eligible: '기계 간 역할을 제거하십시오',
  },
  scopes_per_role_limit: {
    name: '역할 권한',
    limited: '{{count, number}} 역할당 권한',
    limited_other: '{{count, number}} 역할당 권한',
    unlimited: '제한 없는 역할당 권한',
    not_eligible: '역할 권한을 제거하십시오',
  },
  hooks_limit: {
    name: '웹훅',
    limited: '{{count, number}}개의 웹훅',
    limited_other: '{{count, number}}개의 웹훅',
    unlimited: '무제한 웹훅',
    not_eligible: '웹훅을 삭제하세요',
  },
  organizations_enabled: {
    name: '조직',
    limited: '조직',
    unlimited: '조직',
    not_eligible: '조직을 제거하십시오',
  },
  audit_logs_retention_days: {
    name: '감사 로그 보존 기간',
    limited: '감사 로그 보존 기간: {{count, number}} 일',
    limited_other: '감사 로그 보존 기간: {{count, number}} 일',
    unlimited: '제한 없는 기간',
    not_eligible: '감사 로그 없음',
  },
  email_ticket_support: {
    name: '이메일 지원 티켓',
    limited: '{{count, number}}시간 이메일 지원 티켓',
    limited_other: '{{count, number}}시간 이메일 지원 티켓',
    unlimited: '이메일 지원 티켓',
    not_eligible: '이메일 지원 티켓 없음',
  },
  mfa_enabled: {
    name: '다중 인증',
    limited: '다중 인증',
    unlimited: '다중 인증',
    not_eligible: '다중 인증 제거',
  },
  sso_enabled: {
    name: '기업 SSO',
    limited: '기업 SSO',
    unlimited: '기업 SSO',
    not_eligible: '기업 SSO를 제거하십시오',
  },
  tenant_members_limit: {
    /** UNTRANSLATED */
    name: 'Tenant members',
    /** UNTRANSLATED */
    limited: '{{count, number}} tenant member',
    /** UNTRANSLATED */
    limited_other: '{{count, number}} tenant members',
    /** UNTRANSLATED */
    unlimited: 'Unlimited tenant members',
    /** UNTRANSLATED */
    not_eligible: 'Remove your tenant members',
  },
};

export default Object.freeze(quota_item);
