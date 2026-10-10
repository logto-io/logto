const cloud = {
  self_hosted_licenses: {
    title: '자체 호스팅 라이선스',
    description: '계정이 소유한 라이선스를 확인하고 자체 호스팅 배포용 키를 복사하세요.',
    empty_title: '아직 자체 호스팅 라이선스가 없습니다',
    empty_description:
      '이 계정에 할당된 라이선스가 여기에 표시됩니다. Cloud 테넌트는 필요하지 않습니다.',
    load_error: '라이선스를 불러올 수 없습니다. 다시 시도해 주세요.',
    period_end: '현재 기간 종료일',
    keys_title: '라이선스 키',
    keys_description: '키를 안전하게 보관하고 배포 환경에 맞는 키를 사용하세요.',
    production_key: '프로덕션 키',
    non_production_key: '비프로덕션 키',
    keys_unavailable: '이 라이선스의 키를 사용할 수 없습니다. 도움이 필요하면 지원팀에 문의하세요.',
    issue_keys: '두 라이선스 키 발급',
    issue_error: '라이선스 키를 발급할 수 없습니다. 다시 시도해 주세요.',
    install_title: '라이선스 설치',
    install_description:
      '두 키는 동일한 기능과 할당량을 제공합니다. 설치한 키에 따라 배포가 프로덕션 또는 비프로덕션 환경으로 구분됩니다.',
    install_copy: '프로덕션 배포에는 프로덕션 키를, 개발 및 테스트에는 비프로덕션 키를 복사하세요.',
    install_paste: '자체 호스팅 콘솔에서 설정 → 라이선스를 열고 키를 붙여 넣어 설치하세요.',
    status: {
      active: '활성',
      past_due: '결제 연체',
      canceling: '기간 종료 시 취소',
      canceled: '취소됨',
      unpaid: '미결제',
      expired: '만료됨',
      revoked: '철회됨',
    },
  },
  console_sso: {
    back_to_list: 'Console SSO로 돌아가기',
    create: '커넥터 추가',
    title: '콘솔 SSO',
    description: '자체 ID 제공자를 구성하여 싱글 사인온으로 Logto Console에 로그인하세요.',
    domain_bound: '연결됨',
    domain_pending: '확인 중',
    domain_verify_step: '도메인 확인',
    domain_bind_step: '이메일 도메인 연결',
    domain_add_placeholder: '이메일 도메인 추가',
    domain_bound_description:
      '이 도메인은 Console SSO에서 활성 상태입니다. TXT 확인 레코드는 삭제되었습니다.',
    domain_dns_instructions: '도메인 소유권을 확인하려면 DNS 공급자에 이 TXT 레코드를 추가하세요.',
    domain_waiting_for_dns: 'TXT 레코드를 기다리는 중입니다. 10초마다 다시 확인합니다.',
    domain_proven_unbound: '도메인 소유권은 확인되었지만 연결이 완료되지 않았습니다.',
    domain_verified: '도메인 소유권이 확인되었습니다.',
    domain_binding_pending: '확인 후 연결이 자동으로 시작됩니다.',
    domain_remove_description:
      'Console SSO에서 {{domain}}을(를) 제거하시겠어요? 연결된 도메인을 제거하면 해당 이메일 주소의 SSO 검색이 중단됩니다.',
    domain_invalid: '올바른 이메일 도메인을 입력하세요.',
    domain_conflict: '이 도메인은 이미 다른 Console SSO 커넥터에 연결되어 있습니다.',
    domain_invalid_provider: '이 도메인을 연결하기 전에 연결 설정을 완료하세요.',
    domain_dns_timeout: 'DNS 확인에 실패했습니다. 자동으로 다시 시도합니다.',
    domain_recovery: '도메인 변경이 완료되지 않았습니다.',
    start_over: '다시 시작',
    start_over_confirmation:
      '다시 시작하면 완료되지 않은 SSO 구성이 삭제될 수 있습니다. 계속하시겠습니까?',
    resume_creation:
      '완료되지 않은 생성 작업이 있습니다. 동일한 공급자로 계속하여 이 커넥터를 복구하세요.',
  },
  general: {
    onboarding: '온보딩',
  },
  create_tenant: {
    page_title: '테넌트 만들기',
    title: '첫 번째 테넌트 만들기',
    description:
      '테넌트는 사용자 신원, 애플리케이션 및 기타 모든 Logto 리소스를 관리할 수 있는 독립된 환경입니다.',
    invite_collaborators: '이메일로 협력자를 초대하세요',
    hear_about_us: {
      title: 'Logto를 처음 어떻게 알게 되었나요?',
      detail_placeholder: '자세히 알려주세요 (선택 사항)',
      options: {
        search_engine: '검색 엔진 (Google, Bing 등)',
        ai_assistant: 'AI 어시스턴트 (ChatGPT, Claude, Gemini 등)',
        github_oss: 'GitHub 또는 오픈 소스 디렉터리',
        friend_colleague: '친구 또는 동료',
        powered_by: 'Logto를 사용하는 앱의 로그인 페이지',
        content_social: '소셜 미디어, 글 또는 영상 (YouTube, X, Reddit 등)',
        other: '기타',
      },
    },
  },
  social_callback: {
    title: '성공적으로 로그인했어요',
    description:
      '소셜 계정을 사용하여 로그인에 성공했어요. Logto의 모든 기능을 원활하게 통합하고 접근하려면 당신의 소셜 연동을 구성하는 것이 좋습니다.',
    notice:
      '테스트 환경에서는 데모 커넥터를 사용하지 않도록 해주세요. 테스트를 완료한 후에는 데모 커넥터를 삭제하고 자격 증명을 사용하여 직접 커넥터를 설정해 주세요.',
  },
  tenant: {
    create_tenant: '테넌트 생성하기',
  },
};

export default Object.freeze(cloud);
