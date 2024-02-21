const featured_plan_content = {
  mau: {
    free_plan: '{{count, number}} MAU까지',
    pro_plan: '무제한 MAU',
  },
  m2m: {
    free_plan: '{{count, number}} 기기 간 통신',
    pro_plan: '추가 기기 간 통신',
  },
  third_party_apps: '타사 응용 프로그램을위한 IdP',
  mfa: '다중 인증',
  sso: '기업 SSO',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} 역할 및 {{permissionCount, number}} 역할당 권한',
    pro_plan: '역할당 무제한 역할 및 권한',
  },
  organizations: '조직',
  audit_logs: '감사 로그 보존: {{count, number}} 일',
};

export default Object.freeze(featured_plan_content);
