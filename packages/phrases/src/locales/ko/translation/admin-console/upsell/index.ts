import paywall from './paywall.js';

const upsell = {
  upgrade_plan: '플랜 업그레이드',
  compare_plans: '플랜 비교',
  view_plans: '플랜 보기',
  create_tenant: {
    title: '테넌트 플랜 선택하기',
    description:
      'Logto는 성장 중인 기업을 위해 혁신적이고 저렴한 가격으로 디자인된 경쟁력 있는 플랜 옵션을 제공합니다. <a>더 알아보기</a>',
    base_price: '기본 가격',
    monthly_price: '{{value, number}}/월',
    mau_unit_price: 'MAU 단가',
    view_all_features: '모든 기능 보기',
    select_plan: '<name/> 선택',
    free_tenants_limit: '최대 {{count, number}}개 무료 테넌트',
    free_tenants_limit_other: '최대 {{count, number}}개 무료 테넌트',
    most_popular: '가장 인기 있는 플랜',
    upgrade_success: '<name/>으로 업그레이드 성공!',
  },
  mau_exceeded_modal: {
    title: 'MAU 한도를 초과했습니다. 플랜을 업그레이드하세요.',
    notification:
      '현재 MAU가 <planName/>의 한도를 초과했습니다. 로그토 서비스 중단을 피하기 위해 프리미엄으로 플랜을 업그레이드하세요.',
    update_plan: '플랜 업데이트',
  },
  payment_overdue_modal: {
    title: '청구서 지불 연체',
    notification:
      '이런! 테넌트 <span>{{name}}</span>의 청구서 결제에 실패했습니다. Logto 서비스 중단을 피하기 위해 즉시 청구서를 지불하십시오.',
    unpaid_bills: '미납 청구서',
    update_payment: '지불 업데이트',
  },
  /** UNTRANSLATED */
  charge_notification_for_quota_limit:
    'You have reached your quota limit. We may add charges for features that go beyond your quota limit as add-ons, once we finalize the prices.',
  /** UNTRANSLATED */
  charge_notification_for_token_limit:
    'You have reached your {{value}}M token quota limit. We may add charges for features that go beyond your quota limit as add-ons, once we finalize the prices.',
  paywall,
};

export default Object.freeze(upsell);
