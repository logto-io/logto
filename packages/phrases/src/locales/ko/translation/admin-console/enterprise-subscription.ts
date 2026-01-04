const enterprise_subscription = {
  page_title: '구독',
  title: '구독 관리',
  subtitle: '다중 테넌트 구독 세부 정보 및 청구 정보를 확인하고 관리합니다.',
  tab: {
    subscription: '구독',
    billing_history: '청구 내역',
  },
  subscription: {
    title: '구독',
    description: '현재 구독 계획 사용 세부 정보 및 청구 정보를 검토하십시오.',
    enterprise_plan_title: '엔터프라이즈 플랜',
    enterprise_plan_description:
      '이것은 당신의 엔터프라이즈 플랜 구독이며 이 할당량은 엔터프라이즈 구독 하의 모든 테넌트에 걸쳐 공유됩니다.',
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
