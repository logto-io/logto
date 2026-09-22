const tenants = {
  title: '설정',
  description: '테넌트 설정을 효율적으로 관리하고 도메인을 사용자 정의합니다.',
  oss_description: '계정 보안을 위해 여기에서 계정 설정을 변경하고 개인 정보를 관리하세요.',
  tabs: {
    settings: '설정',
    members: '멤버',
    domains: '도메인',
    oidc_configs: 'OIDC 구성',
    subscription: '구독 및 청구',
    billing_history: '청구 내역',
    license: '라이선스',
  },
  license: {
    purchase_title: '셀프 호스팅 요금제',
    purchase_description:
      '셀프 호스팅 프로 및 엔터프라이즈 요금제는 Logto 브랜딩 숨기기, 자체 UI 사용, IdP 시작 SSO, 콘솔 공동 관리, 무제한 SAML 애플리케이션 등 유료 기능을 내 인스턴스에서 사용할 수 있게 합니다. 요금제를 구매하고 라이선스 키를 받아보세요.',
    purchase_button: '셀프 호스팅 요금제 보기',
    install_title: '라이선스 설치',
    install_description: '셀프 호스팅 요금제를 구매한 후 받은 라이선스 키를 붙여넣으세요.',
    install_button: '라이선스 설치',
    key_field: '라이선스 키',
    key_field_description:
      '키는 내 인스턴스에서 검증되며 외부로 전송되지 않습니다. 가지고 있는 키가 만료되었다면 Logto 계정에서 새 키를 받으세요.',
    key_placeholder: '여기에 라이선스 키를 붙여넣으세요',
    installed_toast: '라이선스를 설치했습니다.',
    details_title: '라이선스',
    details_description: '이 인스턴스에 설치된 라이선스와 그 권한입니다.',
    plan_field: '요금제',
    environment_field: '환경',
    environment_production: '프로덕션',
    environment_non_production: '비프로덕션',
    expires_at_field: '만료일',
    installed_at_field: '설치일',
    last_refreshed_at_field: '마지막 새로 고침 시간',
    grace_ends_at_field: '유예 기간 종료일',
    refresh_expired_description:
      '라이선스 키가 {{expiresAt}}에 만료되었습니다. Logto가 갱신을 시도하는 동안 라이선스 기능은 {{graceEndsAt}}까지 계속 사용할 수 있습니다.',
    refresh_refused_description:
      '라이선스가 {{reason}} 상태이므로 라이선스 갱신이 거부되었습니다. 라이선스 기능은 {{graceEndsAt}}까지 계속 사용할 수 있습니다.',
    refusal_reason_canceled: '취소됨',
    refusal_reason_unpaid: '미납',
    refusal_reason_expired: '만료됨',
    refusal_reason_revoked: '취소됨',
    refusal_reason_unknown: '사용할 수 없음',
    grace_expired_description:
      '라이선스 유예 기간이 {{graceEndsAt}}에 끝났습니다. 이 배포는 OSS 기본값으로 되돌아갔습니다. Logto Cloud에서 새 라이선스 키를 받아 다시 설치하세요.',
    get_fresh_key_button: '새 라이선스 키 받기',
    replace_button: '라이선스 교체',
  },
  members: {
    card_title: 'Logto Cloud로 테넌트를 더 안전하게 관리하세요',
    card_description:
      '하나의 관리자 계정을 공유하지 않고도 테넌트에 관리자나 협업자를 추가할 수 있습니다.',
    card_action: 'Logto Cloud 살펴보기',
    self_hosted_card_title: '셀프 호스팅 플랜으로 테넌트를 더 안전하게 관리하세요',
    self_hosted_card_description:
      '하나의 관리자 계정을 공유하지 않고도 테넌트에 관리자나 협업자를 추가할 수 있습니다.',
    self_hosted_card_action: '셀프 호스팅 플랜 살펴보기',
  },
  settings: {
    title: '설정',
    description: '테넌트 이름 설정 및 호스팅된 데이터 영역 및 테넌트 유형을 확인합니다.',
    tenant_id: '테넌트 ID',
    tenant_name: '테넌트 이름',
    tenant_instance: '인스턴스를 선택하세요',
    tenant_instance_description:
      '테넌트가 호스팅될 위치를 선택하세요. 공용 공유 인프라를 위해 Logto Cloud 를 선택하거나, 전용 리소스를 위한 개별 인스턴스를 선택하세요.',
    tenant_region: '데이터 호스팅 영역',
    tenant_region_description:
      '테넌트 리소스 (사용자, 앱 등) 가 호스팅되는 물리적 위치입니다. 생성 후에는 변경할 수 없습니다.',
    tenant_region_tip: '당신의 테넌트 자원은 {{region}}에 호스팅됩니다. <a>자세히 알아보기</a>',
    environment_tag_development: '개발',
    environment_tag_production: '프로드',
    tenant_type: '테넌트 유형',
    development_description:
      '테스트 용이며 프로덕션에서 사용하지 마십시오. 구독이 필요하지 않습니다. 모든 프로 기능이 있지만 로그인 배너와 같은 제한이 있습니다.',
    production_description:
      '최종 사용자가 사용하는 앱을 위한 것으로 유료 구독이 필요할 수 있습니다.',
    tenant_info_saved: '테넌트 정보가 성공적으로 저장되었습니다.',
    tenant_mfa: '다단계 인증',
    tenant_mfa_description: '이 테넌트에 접근하려면 구성원이 다단계 인증을 설정해야 합니다.',
    enterprise_sso: '엔터프라이즈 SSO',
    enterprise_sso_description:
      '유료 플랜에서 사용 가능합니다. 엔터프라이즈 SSO를 활성화하여 모든 구성원이 조직의 ID 공급자를 사용하여 Logto Cloud 콘솔에 로그인할 수 있도록 하려면 문의해 주세요.',
  },
  full_env_tag: {
    development: '개발',
    production: '프로드',
  },
  deletion_card: {
    title: '삭제',
    tenant_deletion: '테넌트 삭제',
    tenant_deletion_description:
      '테넌트를 삭제하면 관련된 모든 사용자 데이터와 설정이 영구적으로 삭제됩니다. 신중하게 진행해주십시오.',
    tenant_deletion_button: '테넌트 삭제',
  },
  leave_tenant_card: {
    title: '나가기',
    leave_tenant: '테넌트 나가기',
    leave_tenant_description:
      '테넌트에 속한 모든 리소스는 그대로 유지되지만 해당 테넌트에 더 이상 액세스할 수 없습니다.',
    last_admin_note: '테넌트에서 나가려면 최소 한 명 이상의 관리자가 있어야 합니다.',
  },
  create_modal: {
    title: '테넌트 만들기',
    subtitle: '분리된 리소스와 사용자를 가지는 새 테넌트를 만듭니다.',
    tenant_id: '테넌트 ID',
    tenant_usage_purpose: '이 테넌트를 사용하는 목적은 무엇입니까?',
    development_description:
      '테스트 용으로만 사용하고 프로덕션에서 사용하지 마십시오. 구독이 필요하지 않습니다.',
    development_description_for_private_regions:
      '테스트 용으로만 사용하고 프로덕션에서 사용하지 마십시오.',
    development_hint: '로그인 배너와 같은 제한이 있지만 모든 프로 기능이 있습니다.',
    production_description: '최종 사용자가 사용하기 위한 것으로 유료 구독이 필요할 수 있습니다.',
    available_plan: '사용 가능한 요금제:',
    create_button: '테넌트 만들기',
    tenant_name_placeholder: '내 테넌트',
    tenant_created: '테넌트가 성공적으로 생성되었습니다.',
    invitation_failed: '초대 전송에 실패했습니다. 나중에 설정 -> 멤버에서 다시 시도하십시오.',
    tenant_type_description: '생성 후에는 변경할 수 없습니다.',
    tenant_id_invalid:
      '테넌트 ID는 소문자, 숫자, 하이픈만 포함할 수 있으며 {{max}}자를 초과할 수 없습니다.',
    tenant_id_placeholder: '테넌트 ID',
    tenant_id_tip:
      '테넌트 ID를 사용자 정의합니다. 비워두면 Logto가 기본 ID를 생성합니다. 테넌트 ID는 생성 후 변경할 수 없습니다.',
  },
  dev_tenant_migration: {
    title: '사용자 정의 테넌트로 전환하여 Pro 기능을 무료로 이용할 수 있습니다!',
    affect_title: '이로 인한 영향은?',
    hint_1:
      '우리는 이전의 <strong>환경 태그</strong>를 <strong>“개발”</strong> 및 <strong>“프로드”</strong> 두 가지 새 테넌트 유형으로 대체합니다.',
    hint_2:
      '원활한 전환과 기능의 중단 없이 모든 초기 생성 된 테넌트가 이전 구독과 함께 <strong>프로드</strong> 테넌트 유형으로 상승합니다.',
    hint_3: '걱정 마세요. 다른 설정은 그대로 유지됩니다.',
    about_tenant_type: '테넌트 유형 정보',
  },
  delete_modal: {
    title: '테넌트 삭제',
    description_line1:
      '테넌트 "<span>{{name}}</span>" 을(를) 환경 접미사 태그 "<span>{{tag}}</span>" 와 함께 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며 모든 데이터 및 테넌트 정보가 영구적으로 삭제됩니다.',
    description_line2:
      '테넌트 삭제 전에 도움을 받을 수도 있습니다. <span><a>이메일을 통해 문의하십시오</a></span>',
    description_line3: '확인하려는 테넌트 이름 "<span>{{name}}</span>" 을(를) 입력하십시오.',
    delete_button: '영구 삭제',
    cannot_delete_title: '이 테넌트를 삭제할 수 없습니다',
    cannot_delete_description:
      '죄송합니다. 현재이 테넌트를 삭제할 수 없습니다. 무료 플랜에 있고 미결제 청구서가 없는지 확인하십시오.',
  },
  leave_tenant_modal: {
    description: '이 테넌트를 나가시겠습니까?',
    leave_button: '나가기',
  },
  tenant_landing_page: {
    title: '아직 테넌트를 만들지 않았습니다.',
    description:
      'Logto 를 사용하여 프로젝트를 구성하려면 새 테넌트를 만드세요. 로그아웃하거나 계정을 삭제하려면 오른쪽 상단 모서리에있는 아바타 버튼을 클릭하세요.',
    create_tenant_button: '테넌트 만들기',
  },
  status: {
    mau_exceeded: 'MAU 초과',
    token_exceeded: '토큰 초과',
    suspended: '정지됨',
    overdue: '만료됨',
  },
  tenant_suspended_page: {
    title: '테넌트 정지. 접근을 복구하려면 문의하세요.',
    description_1:
      '매우 유감스럽게도 테넌트 계정이 일시적으로 정지되었으며, MAU 한도 초과, 연체된 결제 또는 다른 무단 조치 등 부적절한 사용으로 인한 것입니다.',
    description_2:
      '자세한 설명이 필요한 경우, 우려 사항이 있거나 기능을 완전히 복원하고 테넌트를 차단 해제하려면 바로 연락 주시기 바랍니다.',
  },
  production_tenant_notification: {
    text: '무료 테스트를 위한 개발 테넌트에 있습니다. 라이브로 전환하려면 프로덕션 테넌트를 만드세요.',
    action: '테넌트 만들기',
  },
};

export default Object.freeze(tenants);
