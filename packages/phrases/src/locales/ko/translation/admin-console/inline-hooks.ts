const inline_hooks = {
  page_title: '인라인 훅',
  title: '인라인 훅',
  subtitle: '인증 흐름의 특정 지점에서 사용자 지정 코드를 실행하여 Logto 동작을 확장합니다.',
  status: {
    not_configured: '구성되지 않음',
    configured: '구성됨',
    enabled: '활성화됨',
    disabled: '비활성화됨',
  },
  hooks: {
    post_first_factor_verification: {
      name: '첫 번째 인증 요소 확인 후',
      description:
        '첫 번째 인증 요소가 확인된 후 로그인 절차가 계속되기 전에 사용자 지정 로직을 실행합니다.',
    },
    post_sign_in: {
      name: '로그인 후',
      description: '사용자가 성공적으로 로그인한 후 사용자 지정 로직을 실행합니다.',
    },
  },
};

export default Object.freeze(inline_hooks);
