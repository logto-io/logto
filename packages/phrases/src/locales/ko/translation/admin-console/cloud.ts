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
  },
  social_callback: {
    title: '성공적으로 로그인했어요',
    description:
      '소셜 계정을 사용하여 로그인에 성공했어요. Logto의 모든 기능을 원활하게 통합하고 접근하려면 당신의 소셜 연동을 구성하는 것이 좋습니다.',
    /** UNTRANSLATED */
    notice:
      "Please avoid using the demo connector for production purposes. Once you've completed testing, kindly delete the demo connector and set up your own connector with your credentials.",
  },
  tenant: {
    create_tenant: '테넌트 생성하기',
  },
};

export default Object.freeze(cloud);
