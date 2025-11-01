const content = {
  terms_of_use: {
    title: 'TERMS',
    description: '컴플라이언스 요구 사항을 충족하기 위해 이용 약관과 개인정보 보호를 추가하세요.',
    terms_of_use: '이용 약관 URL',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: '개인정보 처리방침 URL',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: '약관에 동의하기',
    agree_policies: {
      automatic: '자동으로 약관에 계속 동의하기',
      manual_registration_only: '등록 시에만 체크박스 동의 요구',
      manual: '등록 시와 로그인 시 모두 체크박스 동의 요구',
    },
  },
  languages: {
    title: '언어',
    enable_auto_detect: '자동 감지 활성화',
    description:
      '소프트웨어가 사용자의 로케일 설정을 감지하여 해당 언어로 전환합니다. 영어 UI를 다른 언어로 번역해 새 언어를 추가할 수 있습니다.',
    manage_language: '언어 관리',
    default_language: '기본 언어',
    default_language_description_auto:
      '감지된 사용자 언어가 현재 언어 라이브러리에 없을 때 기본 언어가 사용됩니다.',
    default_language_description_fixed:
      '자동 감지를 끄면 기본 언어만 표시됩니다. 언어 확장을 위해 자동 감지를 켜세요.',
  },
  support: {
    title: '지원',
    subtitle: '오류 페이지에 지원 채널을 표시하여 사용자에게 빠른 도움을 제공합니다.',
    support_email: '지원 이메일',
    support_email_placeholder: 'support@email.com',
    support_website: '지원 웹사이트',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: '언어 관리',
    subtitle:
      '언어와 번역을 추가해 제품 경험을 현지화하세요. 당신이 추가한 언어를 기본 언어로 설정할 수 있습니다.',
    add_language: '언어 추가',
    logto_provided: 'Logto 제공',
    key: '키',
    logto_source_values: 'Logto 원본 값',
    custom_values: '사용자 정의 값',
    clear_all_tip: '모든 값 지우기',
    unsaved_description: '저장하지 않고 페이지를 떠나면 변경 사항이 저장되지 않습니다.',
    deletion_tip: '언어 삭제',
    deletion_title: '추가한 언어를 삭제하시겠습니까?',
    deletion_description: '삭제 후에는 사용자가 해당 언어로 다시 탐색할 수 없습니다.',
    default_language_deletion_title: '기본 언어는 삭제할 수 없습니다.',
    default_language_deletion_description:
      "'{{language}}'는 기본 언어로 설정되어 삭제할 수 없습니다.",
  },
};

export default Object.freeze(content);
