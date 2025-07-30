const user_identity_details = {
  social_identity_page_title: '소셜 신원 세부 정보',
  back_to_user_details: '사용자 세부 정보로 돌아가기',
  delete_identity: `신원 연결 제거`,
  social_account: {
    title: '소셜 계정',
    description: '연결된 {{connectorName}} 계정에서 동기화된 사용자 데이터와 프로필 정보를 봅니다.',
    provider_name: '소셜 신원 제공자 이름',
    identity_id: '소셜 신원 ID',
    user_profile: '소셜 신원 제공자에서 동기화된 사용자 프로필',
  },
  sso_account: {
    title: '기업 SSO 계정',
    description: '연결된 {{connectorName}} 계정에서 동기화된 사용자 데이터와 프로필 정보를 봅니다.',
    provider_name: '기업 SSO 신원 제공자 이름',
    identity_id: '기업 SSO 신원 ID',
    user_profile: '기업 SSO 신원 제공자에서 동기화된 사용자 프로필',
  },
  token_storage: {
    title: '액세스 토큰',
    description:
      '{{connectorName}} 에서 액세스 및 갱신 토큰을 비밀 금고에 저장합니다. 반복적인 사용자 동의 없이 자동화된 API 호출이 가능합니다.',
  },
  access_token: {
    title: '액세스 토큰',
    description_active:
      '액세스 토큰이 활성 상태이며 비밀 금고에 안전하게 저장되었습니다. 귀하의 제품은 이를 사용하여 {{connectorName}} API 에 접근할 수 있습니다.',
    description_inactive:
      '이 액세스 토큰은 비활성 상태입니다 (예: 해제됨). 사용자는 기능 복원을 위해 접근을 다시 승인해야 합니다.',
    description_expired:
      '이 액세스 토큰이 만료되었습니다. 갱신은 갱신 토큰을 사용하여 다음 API 요청 시 자동으로 이루어집니다. 갱신 토큰이 없으면, 사용자는 다시 인증해야 합니다.',
  },
  refresh_token: {
    available:
      '갱신 토큰이 있습니다. 액세스 토큰이 만료되면 갱신 토큰을 사용하여 자동으로 갱신됩니다.',
    not_available:
      '갱신 토큰이 없습니다. 액세스 토큰이 만료된 후, 사용자는 새 토큰을 얻기 위해 다시 인증해야 합니다.',
  },
  token_status: '토큰 상태',
  created_at: '생성 일시',
  updated_at: '업데이트 일시',
  expires_at: '만료 일시',
  scopes: '범위',
  delete_tokens: {
    title: '토큰 삭제',
    description: '저장된 토큰을 삭제합니다. 사용자는 기능 복원을 위해 접근을 다시 승인해야 합니다.',
    confirmation_message:
      '토큰을 삭제하시겠습니까? Logto 비밀 금고는 저장된 {{connectorName}} 액세스 및 갱신 토큰을 제거할 것입니다. 이 사용자는 {{connectorName}} API 접근을 복원하기 위해 다시 승인해야 합니다.',
  },
  token_storage_disabled: {
    title: '이 커넥터에 대한 토큰 저장이 비활성화되었습니다',
    description:
      '사용자는 현재 {{connectorName}} 을(를) 사용하여 로그인, 계정 연결, 또는 각 동의 흐름 중 프로필을 동기화할 수 있습니다. {{connectorName}} API 에 접근하고 사용자 대신 작업을 수행하려면, 토큰 저장을 활성화하십시오',
  },
};

export default Object.freeze(user_identity_details);
