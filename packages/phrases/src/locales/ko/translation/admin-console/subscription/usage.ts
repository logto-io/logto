const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'MAU 는 청구 주기 동안 Logto 와 적어도 한 번 토큰을 교환한 고유 사용자입니다. Pro 플랜에는 무제한입니다. <a>자세히 알아보기</a>',
  },
  organizations: {
    title: '조직',
    description: '{{usage}}',
    tooltip:
      '매달 ${{price, number}} 의 정액 요금으로 추가 기능입니다. 조직의 수나 활동 수준에 상관없이 가격은 영향을 받지 않습니다.',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      '매달 ${{price, number}} 의 정액 요금으로 추가 기능입니다. 사용된 인증 요인의 수에 상관없이 가격은 영향을 받지 않습니다.',
  },
  enterprise_sso: {
    title: '기업 SSO',
    description: '{{usage}}',
    tooltip: '매달 SSO 연결당 ${{price, number}} 의 추가 기능입니다.',
  },
  api_resources: {
    title: 'API 리소스',
    description: '{{usage}} <span>(처음 3개는 무료)</span>',
    tooltip:
      '매달 자원당 ${{price, number}} 의 추가 기능입니다. 처음 3개의 API 리소스는 무료입니다.',
  },
  machine_to_machine: {
    title: '기계 대 기계',
    description: '{{usage}} <span>(처음 1개는 무료)</span>',
    tooltip:
      '매달 앱당 ${{price, number}} 의 추가 기능입니다. 첫 번째 기계 대 기계 앱은 무료입니다.',
  },
  tenant_members: {
    title: '테넌트 멤버',
    description: '{{usage}} <span>(처음 3명은 무료)</span>',
    tooltip:
      '매달 멤버당 ${{price, number}} 의 추가 기능입니다. 처음 3명의 테넌트 멤버는 무료입니다.',
  },
  tokens: {
    title: '토큰',
    description: '{{usage}}',
    tooltip:
      '백만 개의 토큰당 ${{price, number}} 의 추가 기능입니다. 처음 100만 개의 토큰은 포함되어 있습니다.',
  },
  hooks: {
    title: '훅',
    description: '{{usage}} <span>(처음 10개는 무료)</span>',
    tooltip: '훅 하나당 ${{price, number}} 의 추가 기능입니다. 처음 10개의 훅이 포함되어 있습니다.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      '현재 청구 주기 동안 변경 사항이 발생하면 변경 후 첫 달 동안 다음 청구서가 약간 높을 수 있습니다. 청구서에는 현재 주기의 청구되지 않은 사용량에 대한 추가 비용과 다음 주기의 전체 요금이 부과된 기본 가격 ${{price, number}} 가 포함됩니다. <a>자세히 알아보기</a>',
  },
};

export default Object.freeze(usage);
