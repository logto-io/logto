const quota_table = {
  quota: {
    title: '할당량',
    tenant_limit: '테넌트 제한',
    base_price: '기본 가격',
    mau_unit_price: '* MAU 단가',
    mau_limit: 'MAU 제한',
  },
  application: {
    title: '애플리케이션',
    total: '총 애플리케이션 수',
    m2m: '머신 투 머신',
  },
  resource: {
    title: 'API 리소스',
    resource_count: '리소스 수',
    scopes_per_resource: '리소스 당 권한',
  },
  branding: {
    title: 'UI 및 브랜딩',
    custom_domain: '사용자 정의 도메인',
    custom_css: '사용자 정의 CSS',
    app_logo_and_favicon: '앱 로고와 파비콘',
    dark_mode: '다크 모드',
    i18n: '국제화',
  },
  user_authn: {
    title: '사용자 인증',
    omni_sign_in: '옴니 사인인',
    password: '비밀번호',
    passwordless: '비밀번호 없음 - 이메일과 SMS',
    email_connector: '이메일 커넥터',
    sms_connector: 'SMS 커넥터',
    social_connectors: '소셜 커넥터',
    standard_connectors: '표준 커넥터',
    built_in_email_connector: '내장 이메일 커넥터',
  },
  user_management: {
    title: '사용자 관리',
    user_management: '사용자 관리',
    roles: '역할',
    scopes_per_role: '역할 당 권한',
  },
  audit_logs: {
    title: '감사 로그',
    retention: '보존 기간',
  },
  hooks: {
    title: 'Webhooks',
    hooks: 'Webhooks',
  },
  support: {
    title: '지원',
    community: '커뮤니티',
    customer_ticket: '지원 티켓',
    premium: '프리미엄',
  },
  mau_unit_price_footnote:
    '* 월간 활성 사용자(MAU)는 청구 주기 동안 로그인 빈도에 따라 3단계로 나뉩니다. 각 단계마다 달리 책정되는 MAU 단가가 있습니다.',
  unlimited: '무제한',
  contact: '문의',
  monthly_price: '${{value, number}}/월',
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} 일',
  days_other: '{{count, number}} 일',
  add_on: '부가 기능',
  tier: '레벨{{value, number}}: ',
};

export default Object.freeze(quota_table);
