import featured_plan_content from './featured-plan-content.js';
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
  add_on_quota_item: {
    api_resource: 'API 리소스',
    machine_to_machine: '머신 투 머신 애플리케이션',
    tokens: '{{limit}}M 토큰',
    /** UNTRANSLATED */
    tenant_member: 'tenant member',
  },
  charge_notification_for_quota_limit:
    '{{item}} 할당량 한도를 초과했습니다. Logto는 할당량을 초과하는 사용에 대한 요금을 추가합니다. 새로운 애드온 가격 디자인이 출시된 날부터 청구가 시작됩니다. <a>더 알아보기</a>',
  paywall,
  featured_plan_content,
};

export default Object.freeze(upsell);
