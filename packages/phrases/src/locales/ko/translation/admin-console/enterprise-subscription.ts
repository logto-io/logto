const enterprise_subscription = {
  page_title: '구독',
  title: '구독 관리',
  subtitle: '다중 테넌트 구독 및 청구 내역을 관리하기 위한 것입니다.',
  tab: {
    subscription: '구독',
    billing_history: '청구 내역',
  },
  subscription: {
    title: '구독',
    description: '사용량을 쉽게 추적하고 다음 청구서를 확인하며 원본 계약서를 검토하세요.',
    enterprise_plan_title: '엔터프라이즈 플랜',
    enterprise_plan_description:
      '이것은 당신의 엔터프라이즈 플랜 구독이며 이 할당량은 테넌트들 간에 공유됩니다. 사용량 업데이트가 약간 지연될 수 있습니다.',
    add_on_title: '사용량에 따른 추가 요금',
    add_on_description:
      '이것은 계약 혹은 Logto의 표준 사용량에 따른 요금에 기반한 추가 요금 아이템입니다. 실제 사용량에 따라 청구됩니다.',
    included: '포함됨',
    over_quota: '할당 초과',
    basic_plan_column_title: {
      product: '제품',
      usage: '사용량',
      quota: '할당량',
    },
    add_on_column_title: {
      product: '제품',
      unit_price: '단가',
      quantity: '수량',
      total_price: '합계',
    },
    add_on_sku_price: '${{price}}/월',
    private_region_title: '프라이빗 클라우드 인스턴스 ({{regionName}})',
    shared_cross_tenants: '테넌트에 걸쳐 있음',
  },
  user_subscriptions: {
    description: '선택한 테넌트와 관계없이 개인 구독 및 Enterprise 계약 할당량을 확인하세요.',
    personal_title: '개인 구독',
    personal_description: '과거 구독을 포함하여 계정에 청구되는 구독입니다.',
    price: '가격',
    billing_period: '청구 기간',
    list_price_note:
      '가격에는 세금과 할인이 포함되지 않습니다. 변경 사항은 다음 청구서에 일할 계산되어 반영됩니다.',
    overdue_note:
      '결제가 연체되었습니다. 계속 미납되면 구독이 일시 중지되고 유료 기능이 제거될 수 있습니다.',
    cancel_on: '{{date}}에 취소 예정',
    other_product: '기타 구독',
    enterprise_invoices_description:
      'Enterprise 계약의 청구서입니다. 청구서를 선택하면 내용을 확인하고 청구서 또는 영수증을 다운로드할 수 있습니다.',
    personal_invoices_description:
      '이전 구독을 포함해 계정으로 청구되는 구독의 청구서입니다. 청구서를 선택하면 내용을 확인하고 청구서 또는 영수증을 다운로드할 수 있습니다.',
    credit_note:
      '삭제나 일할 계산으로 발생한 크레딧은 이후 청구서에서 차감되며, 결제 수단으로 즉시 환불되지 않을 수 있습니다.',
    invoice_link_unavailable:
      '이 청구서 페이지를 사용할 수 없습니다. 사본이 필요하면 문의해 주세요.',
    status: {
      active: '활성',
      trialing: '체험 중',
      past_due: '연체',
      unpaid: '미납',
      canceled: '취소됨',
      incomplete: '미완료',
      incomplete_expired: '만료됨',
      paused: '일시 중지됨',
    },
  },
};

export default Object.freeze(enterprise_subscription);
