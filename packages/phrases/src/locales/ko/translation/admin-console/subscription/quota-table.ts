const quota_table = {
  quota: {
    title: '배정량',
    tenant_limit: '테넌트 제한',
    base_price: '기본 가격',
    mau_unit_price: '* MAU 단가',
    mau_limit: 'MAU 제한',
  },
  application: {
    title: '애플리케이션',
    total: '총계',
    m2m: '기계 간 통신',
  },
  resource: {
    title: 'API 자원',
    resource_count: '자원 개수',
    scopes_per_resource: '자원 당 권한',
  },
  branding: {
    title: '브랜딩',
    custom_domain: '사용자 정의 도메인',
  },
  user_authn: {
    title: '사용자 인증',
    omni_sign_in: '옴니 로그인',
    built_in_email_connector: '내장 이메일 커넥터',
    social_connectors: '소셜 커넥터',
    standard_connectors: '표준 커넥터',
  },
  roles: {
    title: '역할',
    roles: '역할',
    scopes_per_role: '역할 당 권한',
  },
  audit_logs: {
    title: '감사 로그',
    retention: '유지 기간',
  },
  hooks: {
    title: '후크',
    amount: '수량',
  },
  support: {
    title: '지원',
    community: '커뮤니티',
    customer_ticket: '고객 문의',
    premium: '프리미엄',
  },
  mau_unit_price_footnote:
    '* 실제 사용된 리소스에 따라 단가가 달라질 수 있으며, Logto는 단가 변경에 대한 설명을 예약합니다.',
  unlimited: '무제한',
  contact: '연락',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/월',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} 일',
  days_other: '{{count, number}} 일',
  add_on: '부가 기능',
};

export default quota_table;
