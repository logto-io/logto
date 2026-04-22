const oss_onboarding = {
  page_title: '온보딩',
  title: '당신에 대해 조금 알려주세요',
  description: '당신과 프로젝트에 대해 조금 알려주세요. 더 나은 Logto를 만드는 데 도움이 됩니다.',
  email: {
    label: '이메일 주소',
    description: '계정 관련 연락이 필요할 때 이 주소를 사용합니다.',
    placeholder: 'email@example.com',
  },
  newsletter: 'Logto의 제품 업데이트, 보안 공지, 큐레이션된 콘텐츠를 받아보세요.',
  project: {
    label: 'Logto를 사용하는 목적',
    personal: '개인 프로젝트',
    company: '회사 프로젝트',
  },
  company_name: {
    label: '회사명',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: '회사의 규모는 어느 정도인가요?',
  },
  errors: {
    email_required: '이메일 주소는 필수입니다',
    email_invalid: '유효한 이메일 주소를 입력하세요',
  },
};

export default Object.freeze(oss_onboarding);
