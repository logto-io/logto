const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  /** UNTRANSLATED */
  limited_status_quota_description: '(First {{quota}} included)',
  /** UNTRANSLATED */
  unlimited_status_quota_description: '(Included)',
  /** UNTRANSLATED */
  disabled_status_quota_description: '(Not included)',
  /** UNTRANSLATED */
  usage_description_with_unlimited_quota: '{{usage}}<span> (Unlimited)</span>',
  /** UNTRANSLATED */
  usage_description_with_limited_quota: '{{usage}}<span> (First {{basicQuota}} included)</span>',
  /** UNTRANSLATED */
  usage_description_without_quota: '{{usage}}<span> (Not included)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU 는 청구 주기 동안 Logto 와 적어도 한 번 토큰을 교환한 고유 사용자입니다. Pro 플랜에는 무제한입니다. <a>자세히 알아보기</a>',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: '조직',
    tooltip:
      '매달 ${{price, number}} 의 정액 요금으로 추가 기능입니다. 조직의 수나 활동 수준에 상관없이 가격은 영향을 받지 않습니다.',
    /** UNTRANSLATED */
    description_for_enterprise: '(Included)',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the organization feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of organizations or their activity.',
    /** UNTRANSLATED */
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Your plan includes the first {{basicQuota}} organizations for free. If you need more, you can add them with the organization add-on at a flat rate of ${{price, number}} per month, regardless of the number of organizations or their activity level.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      '매달 ${{price, number}} 의 정액 요금으로 추가 기능입니다. 사용된 인증 요인의 수에 상관없이 가격은 영향을 받지 않습니다.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: '기업 SSO',
    tooltip: '매달 SSO 연결당 ${{price, number}} 의 추가 기능입니다.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first {{basicQuota}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'API 리소스',
    tooltip:
      '매달 자원당 ${{price, number}} 의 추가 기능입니다. 처음 3개의 API 리소스는 무료입니다.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: '기계 대 기계',
    tooltip:
      '매달 앱당 ${{price, number}} 의 추가 기능입니다. 첫 번째 기계 대 기계 앱은 무료입니다.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: '테넌트 멤버',
    tooltip:
      '매달 멤버당 ${{price, number}} 의 추가 기능입니다. 처음 3명의 테넌트 멤버는 무료입니다.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: '토큰',
    tooltip:
      '백만 개의 토큰당 ${{price, number}} 의 추가 기능입니다. 처음 100만 개의 토큰은 포함되어 있습니다.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per {{tokenLimit}} tokens per month.',
  },
  hooks: {
    title: '훅',
    tooltip:
      '추가 기능은 ${{price, number}}에 {{tokenLimit}} 토큰당 가격이 책정됩니다. 처음 {{basicQuota}} 토큰이 포함되어 있습니다.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      '현재 청구 주기 동안 변경 사항이 발생하면 변경 후 첫 달 동안 다음 청구서가 약간 높을 수 있습니다. 청구서에는 현재 주기의 청구되지 않은 사용량에 대한 추가 비용과 다음 주기의 전체 요금이 부과된 기본 가격 ${{price, number}} 가 포함됩니다. <a>자세히 알아보기</a>',
  },
};

export default Object.freeze(usage);
