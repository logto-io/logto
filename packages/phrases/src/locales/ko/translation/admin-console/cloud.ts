const cloud = {
  general: {
    onboarding: '온보딩',
  },
  welcome: {
    page_title: '환영합니다',
    title: 'Logto Cloud 에 오신 것을 환영합니다! 조금 더 알고 싶어요.',
    description:
      '당신에 대해 더 잘 파악하여 Logto 경험을 특별하게 만들어 드릴게요. 정보는 저희가 안전하게 관리해요.',
    project_field: 'Logto 를 아래의 목적으로 사용해요',
    project_options: {
      personal: '개인 프로젝트',
      company: '기업 프로젝트',
    },
    company_name_field: '회사 이름',
    company_name_placeholder: 'Acme.co',
    stage_field: '지금까지 당신의 제품은 어떤 단계에 있나요?',
    stage_options: {
      new_product: '새로운 프로젝트를 시작하고 빠르고 편리한 솔루션을 찾고 있어요',
      existing_product: '현재 인증을 이전하려고 합니다 (예: 자체 구축, Auth0, Cognito, Microsoft)',
      target_enterprise_ready: '큰 고객들을 얻었으니 제품을 기업에 판매할 준비를 하고 있어요',
    },
    additional_features_field: '알려주고 싶은 다른 사항이 있으세요?',
    additional_features_options: {
      customize_ui_and_flow:
        '내 UI를 직접 구축하고 관리하려고 하지만 Logto의 미리 구축되고 사용자 정의 가능한 솔루션을 사용하지 않는다',
      compliance: 'SOC2와 GDPR가 필수 사항이에요',
      export_user_data: 'Logto 에서 사용자 데이터를 내보낼 수 있는 기능이 필요해요',
      budget_control: '매우 엄격한 예산 통제가 있어요',
      bring_own_auth: '내장 인증 서비스가 있고 Logto 기능만 필요해요',
      others: '위에 나열된 것 중에 없어요',
    },
  },
  sie: {
    page_title: '로그인 환경 변경하기',
    title: '먼저 로그인 환경을 간편하게 사용자화해 보세요.',
    inspire: {
      title: '흥미로운 예시 만들기',
      description:
        '로그인 환경에 대해 확신이 서지 않으시나요? "영감을 주세요"를 클릭하고 마법을 일으켜 보세요!',
      inspire_me: '영감을 주세요',
    },
    logo_field: '앱 로고',
    color_field: '브랜드 색상',
    identifier_field: '식별자',
    identifier_options: {
      email: '이메일',
      phone: '휴대전화',
      user_name: '사용자 이름',
    },
    authn_field: '인증',
    authn_options: {
      password: '비밀번호',
      verification_code: '인증 코드',
    },
    social_field: '소셜 로그인',
    finish_and_done: '완료하고 넘어가기',
    preview: {
      mobile_tab: '모바일',
      web_tab: '웹',
    },
    connectors: {
      unlocked_later: '나중에 잠금 해제',
      unlocked_later_tip:
        '등록 절차를 완료하고 제품에 가입하면 더 많은 소셜 로그인 방법에 액세스할 수 있습니다.',
      notice:
        '데모 연동을 실제 운영 목적으로 사용하지 마세요. 테스트를 완료한 후에는 데모 연동을 삭제하고 자격 증명을 사용하여 고유한 연동을 설정하세요.',
    },
  },
  socialCallback: {
    title: '성공적으로 로그인했어요',
    description:
      '소셜 계정을 사용하여 로그인에 성공했어요. Logto의 모든 기능을 원활하게 통합하고 접근하려면 당신의 소셜 연동을 구성하는 것이 좋습니다.',
  },
  tenant: {
    create_tenant: '테넌트 생성하기',
  },
};

export default Object.freeze(cloud);
