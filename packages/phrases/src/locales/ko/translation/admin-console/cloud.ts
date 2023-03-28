const cloud = {
  welcome: {
    page_title: '환영합니다',
    title: '환영합니다. 당신 만의 Logto Cloud Preview를 만들어 보세요',
    description:
      '오픈 소스 사용자든 클라우드 사용자든, 쇼케이스를 둘러보고 Logto의 모든 가치를 경험해 보세요. 클라우드 미리 보기는 Logto Cloud의 미리 보기 버전으로도 제공돼요.',
    project_field: 'Logto를 아래의 목적으로 사용해요',
    project_options: {
      personal: '개인 프로젝트',
      company: '기업 프로젝트',
    },
    deployment_type_field: '오픈 소스와 클라우드 중 어느 쪽을 선호하시나요?',
    deployment_type_options: {
      open_source: '오픈 소스',
      cloud: '클라우드',
    },
  },
  about: {
    page_title: '본인에 대해 간략히 소개하기',
    title: '당신에 관하여',
    description:
      '당신에 대해 더 잘 파악하여 Logto 경험을 특별하게 만들어 드릴게요. 정보는 저희가 안전하게 관리해요.',
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
  congrats: {
    page_title: '조기 선물 획득하기',
    title: '좋은 소식입니다! Logto Cloud 조기 크레딧을 받을 자격이 있습니다!',
    description:
      '공식 출시 후 Logto Cloud를 <strong>60일</strong> 동안 무료로 구독할 수 있는 기회를 놓치지 마세요! 지금 Logto 팀에 문의하여 자세히 알아보세요.',
    check_out_button: 'Live Preview 확인하기',
    reserve_title: 'Logto 팀과의 시간을 예약하세요',
    reserve_description: '크레딧은 인증 시 한 번만 받을 수 있습니다.',
    book_button: '지금 예약하기',
    join_description: '공식 <a>{{link}}</a>에 참여하여 다른 개발자들과 연결하고 채팅하세요.',
    discord_link: '디스코드 채널',
    enter_admin_console: 'Logto Cloud Preview 참여하기',
  },
  gift: {
    title: '60일 동안 Logto Cloud를 무료로 사용해 보세요. 지금 선발 주자가 되어 보세요!',
    description: '팀과의 일대일 세션을 예약하여 조기 크레딧을 받으세요.',
    reserve_title: 'Logto 팀과의 시간을 예약하세요',
    reserve_description: '크레딧은 평가 시 한 번만 받을 수 있습니다.',
    book_button: '예약하기',
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
        '등록 절차를 완료하고 제품에 가입하면 더 많은 소셜 로그인 방법에 액세스할 수 있어요.',
      notice:
        '데모 연동을 실제 운영 목적으로 사용하지 마세요. 테스트를 완료한 후에는 데모 연동을 삭제하고 자격 증명을 사용하여 고유한 연동을 설정하세요.',
    },
  },
  broadcast: '📣 Logto Cloud(미리보기)에 가입하셨어요',
  socialCallback: {
    title: '성공적으로 로그인했어요',
    description:
      '소셜 계정을 사용하여 로그인에 성공했어요. Logto의 모든 기능을 원활하게 통합하고 접근하려면 당신의 소셜 연동을 구성하는 것이 좋아요.',
  },
};

export default cloud;
