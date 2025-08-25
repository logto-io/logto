const usage = {
  status_active: '사용 중',
  status_inactive: '사용 안 함',
  limited_status_quota_description: '(처음 {{quota}} 포함)',
  unlimited_status_quota_description: '(포함됨)',
  disabled_status_quota_description: '(포함되지 않음)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (무제한)</span>',
  usage_description_with_limited_quota: '{{usage}}<span> (처음 {{basicQuota}} 포함)</span>',
  usage_description_without_quota: '{{usage}}<span> (포함되지 않음)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU 는 청구 주기 동안 Logto 와 적어도 한 번 토큰을 교환한 고유 사용자입니다. Pro 플랜에는 무제한입니다. <a>자세히 알아보기</a>',
    tooltip_for_enterprise:
      'MAU 는 청구 주기 동안 Logto 와 적어도 한 번 토큰을 교환한 고유 사용자입니다. 기업 플랜에서는 무제한입니다.',
  },
  organizations: {
    title: '조직',
    tooltip:
      '매달 ${{price, number}} 의 정액 요금으로 추가 기능입니다. 조직의 수나 활동 수준에 상관없이 가격은 영향을 받지 않습니다.',
    description_for_enterprise: '(포함됨)',
    tooltip_for_enterprise:
      '포함 여부는 플랜에 따라 다릅니다. 조직 기능이 초기 계약에 포함되어 있지 않다면, 활성화 시 청구서에 추가됩니다. 추가 기능은 조직 수나 활동에 관계없이 ${{price, number}}/월 입니다.',
    tooltip_for_enterprise_with_numbered_basic_quota:
      '플랜은 처음 {{basicQuota}} 개의 조직을 무료로 포함합니다. 더 필요하다면, 조직 추가 기능을 통해 월 ${{price, number}} 에 추가할 수 있으며, 조직 수와 활동 수준에 관계없이 정액 요금이 부과됩니다.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      '매달 ${{price, number}} 의 정액 요금으로 추가 기능입니다. 사용된 인증 요인의 수에 상관없이 가격은 영향을 받지 않습니다.',
    tooltip_for_enterprise:
      '포함 여부는 플랜에 따라 다릅니다. MFA 기능이 초기 계약에 포함되어 있지 않다면, 활성화 시 청구서에 추가됩니다. 추가 기능은 사용된 인증 요인의 수에 관계없이 ${{price, number}}/월 입니다.',
  },
  enterprise_sso: {
    title: '기업 SSO',
    tooltip: '매달 SSO 연결당 ${{price, number}} 의 추가 기능입니다.',
    tooltip_for_enterprise:
      '매달 SSO 연결당 ${{price, number}} 의 추가 기능입니다. 플랜에는 처음 {{basicQuota}} 개의 SSO 가 포함되며 무료로 사용할 수 있습니다.',
  },
  api_resources: {
    title: 'API 리소스',
    tooltip:
      '매달 자원당 ${{price, number}} 의 추가 기능입니다. 처음 3개의 API 리소스는 무료입니다.',
    tooltip_for_enterprise:
      '플랜에는 처음 {{basicQuota}} 개의 API 리소스가 포함되어 무료로 사용할 수 있습니다. 더 필요하다면, 매달 API 리소스당 ${{price, number}} 입니다.',
  },
  machine_to_machine: {
    title: '기계 대 기계',
    tooltip:
      '매달 앱당 ${{price, number}} 의 추가 기능입니다. 첫 번째 기계 대 기계 앱은 무료입니다.',
    tooltip_for_enterprise:
      '플랜에는 처음 {{basicQuota}} 개의 기계 대 기계 앱이 무료로 포함되어 있습니다. 더 필요하다면, 매달 앱당 ${{price, number}} 입니다.',
  },
  tenant_members: {
    title: '테넌트 멤버',
    tooltip:
      '추가 기능은 멤버당 매달 ${{price, number}} 의 가격이 책정됩니다. 처음 {{count}} 명의 테넌트 멤버는 무료입니다.',
    tooltip_one:
      '추가 기능은 멤버당 매달 ${{price, number}} 의 가격이 책정됩니다. 처음 {{count}} 명의 테넌트 멤버는 무료입니다.',
    tooltip_other:
      '추가 기능은 멤버당 매달 ${{price, number}} 의 가격이 책정됩니다. 처음 {{count}} 명의 테넌트 멤버는 무료입니다.',
    tooltip_for_enterprise:
      '플랜에는 처음 {{basicQuota}} 명의 테넌트 멤버가 포함되어 무료로 사용할 수 있습니다. 더 필요하다면, 매달 멤버당 ${{price, number}} 입니다.',
  },
  tokens: {
    title: '토큰',
    tooltip:
      '백만 개의 토큰당 ${{price, number}} 의 추가 기능입니다. 처음 100만 개의 토큰은 포함되어 있습니다.',
    tooltip_for_enterprise:
      '플랜에는 처음 {{basicQuota}} 개의 토큰이 포함되어 무료로 사용할 수 있습니다. 더 필요하다면, 매달 {{tokenLimit}} 개의 토큰당 ${{price, number}} 입니다.',
  },
  hooks: {
    title: '훅',
    tooltip:
      '추가 기능은 ${{price, number}}에 {{tokenLimit}} 토큰당 가격이 책정됩니다. 처음 {{basicQuota}} 토큰이 포함되어 있습니다.',
    tooltip_for_enterprise:
      '플랜에는 처음 {{basicQuota}} 개의 훅이 포함되어 무료로 사용할 수 있습니다. 더 필요하다면, 매달 훅당 ${{price, number}} 입니다.',
  },
  security_features: {
    title: '고급 보안',
    tooltip:
      '추가 기능으로 CAPTCHA, 식별자 잠금, 이메일 차단 목록 등을 포함한 전체 고급 보안 번들에 대해 월 ${{price, number}} 의 가격이 책정됩니다.',
  },
  saml_applications: {
    title: 'SAML 앱',
    tooltip: '추가 기능은 매달 SAML 앱당 ${{price, number}} 로 가격이 책정됩니다.',
  },
  third_party_applications: {
    title: '서드파티 앱',
    tooltip: '추가 기능은 매달 앱당 ${{price, number}} 로 가격이 책정됩니다.',
  },
  rbacEnabled: {
    title: '역할',
    tooltip:
      '추가 기능은 매달 ${{price, number}} 의 정액 요금으로 제공됩니다. 글로벌 역할의 수에 의해 가격이 영향을 받지 않습니다.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      '현재 청구 주기 동안 변경 사항이 발생하면 변경 후 첫 달 동안 다음 청구서가 약간 높을 수 있습니다. 청구서에는 현재 주기의 청구되지 않은 사용량에 대한 추가 비용과 다음 주기의 전체 요금이 부과된 기본 가격 ${{price, number}} 가 포함됩니다. <a>자세히 알아보기</a>',
  },
};

export default Object.freeze(usage);
