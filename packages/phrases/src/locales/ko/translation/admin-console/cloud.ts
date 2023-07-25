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
    title_field: '당신의 직함',
    title_options: {
      developer: '개발자',
      team_lead: '팀 리더',
      ceo: 'CEO',
      cto: 'CTO',
      product: '상품',
      others: '기타',
    },
    company_name_field: '회사 이름',
    company_name_placeholder: 'Acme.co',
    company_size_field: '회사의 규모가 어느 정도인가요?',
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: '저는 이것 때문에 가입하려고 해요',
    reason_options: {
      passwordless: '비밀번호 없는 인증 및 UI를 위한 도구를 찾고 있어요',
      efficiency: '즉시 사용 가능한 인증 인프라를 찾고 있어요',
      access_control: '역할 및 책임에 따라 사용자의 접근을 제어하고 싶어요',
      multi_tenancy: '멀티 테넌시 제품을 위한 대응 방법을 찾고 있어요',
      enterprise: '기업 준비성을 위한 SSO 솔루션을 찾고 있어요',
      others: '기타',
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

export default cloud;
