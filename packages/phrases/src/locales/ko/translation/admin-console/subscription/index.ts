import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: '무료 요금제',
  free_plan_description: '사이드 프로젝트 및 초기 Logto 시험용. 신용 카드 없음.',
  hobby_plan: '취미 요금제',
  hobby_plan_description: '개인 개발자나 개발 환경용입니다.',
  pro_plan: '프로 요금제',
  pro_plan_description: 'Logto와 함께 걱정 없이 비즈니스 혜택을 받으세요.',
  enterprise: '기업용',
  current_plan: '현재 요금제',
  current_plan_description:
    '이것은 현재 요금제입니다. 요금제 사용, 다음 청구서 및 더 높은 티어 요금제로 업그레이드할 수 있습니다.',
  plan_usage: '요금제 사용량',
  plan_cycle: 'Plan cycle: {{period}}. 사용량은 {{renewDate}}에 갱신됩니다.',
  next_bill: '다음 청구서',
  next_bill_hint: '계산에 대해 자세히 알아보려면 이 <a>게시물</a>을 참조하세요.',
  next_bill_tip:
    '다음 청구서에는 다음 달을 위한 요금제 기본 가격 및 다양한 티어의 MAU 단가에 따른 사용량 비용이 포함됩니다.',
  manage_payment: '결제 관리',
  overfill_quota_warning:
    '할당량 한도에 도달했습니다. 문제를 방지하기 위해 요금제를 업그레이드하세요.',
  upgrade_pro: '프로 업그레이드',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    '결제 문제가 발생했습니다. 이전 주기에 ${{price, number}}을(를) 처리할 수 없습니다. Logto 서비스 중단을 피하기 위해 결제를 업데이트하세요.',
  downgrade: '다운그레이드',
  current: '현재',
  buy_now: '지금 구매',
  contact_us: '문의하기',
  quota_table,
  billing_history: {
    invoice_column: '송장',
    status_column: '상태',
    amount_column: '금액',
    invoice_created_date_column: '송장 생성 날짜',
  },
  quota_item,
  downgrade_modal: {
    title: '다운그레이드하시겠습니까?',
    description:
      '<targetName />으로 전환하는 경우 이전에 <currentName />에 있던 할당량과 기능에 더 이상 액세스할 수 없음을 알려드립니다.',
    before: '이전: <name />',
    after: '이후: <name />',
    downgrade: '다운그레이드',
    not_eligible: '다운그레이드할 수 없습니다.',
    not_eligible_description:
      '<name />으로 다운그레이드하기 전에 다음 기준을 충족하는지 확인하세요.',
    a_maximum_of: '<item /> 최대',
    help_tip: '다운그레이드 도움이 필요하신가요? <a>문의하기</a>.',
  },
  upgrade_success: '성공적으로 <name/>으로 업그레이드되었습니다.',
  downgrade_success: '성공적으로 <name/>으로 다운그레이드되었습니다.',
  subscription_check_timeout: '구독 확인이 타임아웃되었습니다. 나중에 다시 확인해주세요.',
};

export default subscription;
