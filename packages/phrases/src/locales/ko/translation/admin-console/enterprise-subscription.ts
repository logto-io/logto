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
};

export default Object.freeze(enterprise_subscription);
