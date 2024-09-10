import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: '무료 요금제',
  free_plan_description: '사이드 프로젝트 및 초기 Logto 시험용. 신용 카드 없음.',
  pro_plan: '프로 요금제',
  pro_plan_description: 'Logto와 함께 걱정 없이 비즈니스 혜택을 받으세요.',
  enterprise: '기업용',
  /** UNTRANSLATED */
  enterprise_description:
    'For large-scale organizations requiring advanced features, full customization, and dedicated support to power mission-critical applications. Tailored to your needs for ultimate security, compliance, and performance.',
  /** UNTRANSLATED */
  admin_plan: 'Admin plan',
  /** UNTRANSLATED */
  dev_plan: 'Development plan',
  current_plan: '현재 요금제',
  current_plan_description:
    '현재 사용중인 요금제 정보입니다. 요금제 사용 내역을 쉽게 확인하고, 다가오는 청구서를 확인하며 필요에 따라 요금제를 변경할 수 있습니다.',
  plan_usage: '요금제 사용량',
  plan_cycle: 'Plan cycle: {{period}}. 사용량은 {{renewDate}}에 갱신됩니다.',
  /** UNTRANSLATED */
  next_bill: 'Your upcoming bill',
  next_bill_hint: '계산에 대해 자세히 알아보려면 이 <a>게시물</a>을 참조하세요.',
  /** UNTRANSLATED */
  next_bill_tip:
    'The prices displayed here are tax-exclusive and may be subject to a slight delay in updates. The tax amount will be calculated based on the information you provide and your local regulatory requirements, and will be shown in your invoices.',
  manage_payment: '결제 관리',
  overfill_quota_warning:
    '할당량 한도에 도달했습니다. 문제를 방지하기 위해 요금제를 업그레이드하세요.',
  upgrade_pro: '프로 업그레이드',
  update_payment: '결제 정보 업데이트',
  payment_error:
    '결제 문제가 발생했습니다. 이전 주기에 ${{price, number}}을(를) 처리할 수 없습니다. Logto 서비스 중단을 피하기 위해 결제를 업데이트하세요.',
  downgrade: '다운그레이드',
  current: '현재',
  upgrade: '업그레이드',
  quota_table,
  billing_history: {
    invoice_column: '송장',
    status_column: '상태',
    amount_column: '금액',
    invoice_created_date_column: '송장 생성 날짜',
    invoice_status: {
      void: '취소됨',
      paid: '지불 완료',
      open: '미결제',
      uncollectible: '연체',
    },
  },
  quota_item,
  downgrade_modal: {
    title: '다운그레이드하시겠습니까?',
    description:
      '<targetName />으로 전환하는 경우 이전에 <currentName />에 있던 할당량과 기능에 더 이상 액세스할 수 없음을 알려드립니다.',
    before: '이전: <name />',
    after: '이후: <name />',
    downgrade: '다운그레이드',
  },
  not_eligible_modal: {
    downgrade_title: '다운그레이드할 수 없습니다',
    downgrade_description: '<name/>로 다운그레이드하기 전에 다음 기준을 충족하는지 확인하세요.',
    downgrade_help_tip: '다운그레이드 도움이 필요하세요? <a>문의하세요</a>.',
    upgrade_title: '우리의 존경받는 초기 사용자를 위한 친절한 리마인더',
    upgrade_description:
      '현재 <name />이 허용하는 양보다 더 많이 사용하고 있습니다. 로그토는 이제 공식적으로 출시되었으며 각 플랜에 맞게 설계된 기능을 제공합니다. <name />로 업그레이드를 고려하기 전에, 업그레이드하기 전에 다음 기준을 충족하는지 확인하세요.',
    upgrade_pro_tip: ' 또는 프로 플랜으로 업그레이드를 고려하세요.',
    upgrade_help_tip: '업그레이드 도움이 필요하세요? <a>문의하세요</a>.',
    a_maximum_of: '<item/> 최대 한도',
  },
  upgrade_success: '성공적으로 <name/>으로 업그레이드되었습니다.',
  downgrade_success: '성공적으로 <name/>으로 다운그레이드되었습니다.',
  subscription_check_timeout: '구독 확인이 타임아웃되었습니다. 나중에 다시 확인해주세요.',
  no_subscription: '구독 없음',
};

export default Object.freeze(subscription);
