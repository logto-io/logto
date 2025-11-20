const system_limit = {
  limit_exceeded:
    '이 <planName/> 테넌트는 <a>Logto의 엔티티 정책</a>에 따른 {{entity}} 제한에 도달했습니다.',
  entities: {
    application: '애플리케이션',
    third_party_application: '타사 애플리케이션',
    scope_per_resource: '리소스당 권한',
    social_connector: '소셜 커넥터',
    user_role: '사용자 역할',
    machine_to_machine_role: '머신 간 역할',
    scope_per_role: '역할당 권한',
    hook: '웹훅',
    machine_to_machine: '머신 간 애플리케이션',
    resource: 'API 리소스',
    enterprise_sso: '엔터프라이즈 SSO',
    tenant_member: '테넌트 멤버',
    organization: '조직',
    saml_application: 'SAML 애플리케이션',
    custom_domain: '사용자 정의 도메인',
    user_per_organization: '조직당 사용자',
    organization_user_role: '조직 사용자 역할',
    organization_machine_to_machine_role: '조직 머신 간 역할',
    organization_scope: '조직 권한',
  },
};

export default Object.freeze(system_limit);
