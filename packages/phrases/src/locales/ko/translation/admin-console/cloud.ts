const cloud = {
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
