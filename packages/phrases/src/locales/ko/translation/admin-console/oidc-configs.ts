const oidc_configs = {
  sessions_card_title: 'Logto 세션',
  sessions_card_description:
    'Logto 인증 서버에 저장되는 세션 정책을 사용자 지정합니다. 사용자 전역 인증 상태를 기록하여 SSO를 활성화하고 앱 간 무중단 재인증을 허용합니다.',
  session_max_ttl_in_days: '세션 최대 수명(TTL) (일)',
  session_max_ttl_in_days_tip:
    '세션 생성 시점부터 적용되는 절대 만료 한도입니다. 활동 여부와 관계없이 이 고정 기간이 지나면 세션이 종료됩니다.',
  cloud_private_key_rotation_notice:
    'Logto Cloud에서는 개인 키 회전이 4시간의 유예 기간 후에 적용됩니다.',
};

export default Object.freeze(oidc_configs);
