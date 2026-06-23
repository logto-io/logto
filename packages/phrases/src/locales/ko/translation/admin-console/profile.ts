const profile = {
  link_account: {
    anonymous: '익명',
  },

  delete_account: {
    title: '계정 삭제',
    label: '계정 삭제',
    description:
      '계정을 삭제하면 모든 개인 정보, 사용자 데이터 및 설정이 삭제돼요. 이 작업은 되돌릴 수 없어요.',
    button: '계정 삭제',
    p: {
      has_issue:
        '계정을 삭제하려고 하신다니 유감이에요. 계정을 삭제하기 전에 다음 문제를 해결해야 해요.',
      after_resolved:
        '문제를 해결한 후 계정을 삭제할 수 있어요. 도움이 필요하면 주저하지 말고 연락 주세요.',
      check_information:
        '계정을 삭제하려고 하신다니 유감이에요. 진행하기 전에 다음 정보를 주의 깊게 확인해주세요.',
      remove_all_data:
        '계정을 삭제하면 Logto Cloud 에서 당신에 대한 모든 데이터가 영구적으로 삭제돼요. 중요한 데이터를 백업해주세요.',
      confirm_information:
        '위의 정보가 예상한 것인지 확인해주세요. 계정을 삭제하면 복구할 수 없어요.',
      has_admin_role: '다음 테넌트에서 관리자로 지정되어 있기 때문에, 계정과 함께 삭제될 거예요:',
      has_admin_role_other:
        '다음 테넌트에서 관리자로 지정되어 있기 때문에, 계정과 함께 삭제될 거예요:',
      quit_tenant: '다음 테넌트를 나가려고 합니다:',
      quit_tenant_other: '다음 테넌트를 나가려고 합니다:',
    },
    issues: {
      paid_plan: '다음 테넌트는 유료 플랜을 가지고 있으므로, 구독을 먼저 취소해야 해요:',
      paid_plan_other: '다음 테넌트들은 유료 플랜을 가지고 있으므로, 구독을 먼저 취소해야 해요:',
      subscription_status: '다음 테넌트는 구독 상태에 문제가 있어요:',
      subscription_status_other: '다음 테넌트들은 구독 상태에 문제가 있어요:',
      open_invoice: '다음 테넌트는 미결제 청구서가 있어요:',
      open_invoice_other: '다음 테넌트들은 미결제 청구서가 있어요:',
    },
    error_occurred: '오류가 발생했어요',
    error_occurred_description: '계정을 삭제하는 동안 문제가 발생했어요:',
    request_id: '요청 ID: {{requestId}}',
    try_again_later:
      '나중에 다시 시도해주세요. 문제가 지속되면 요청 ID 와 함께 Logto 팀에 문의하세요.',
    final_confirmation: '최종 확인',
    about_to_start_deletion: '삭제 과정을 시작하려하고 있으며 이 작업은 되돌릴 수 없어요.',
    permanently_delete: '영구적으로 삭제',
  },

  fields: {
    name: '이름',
    name_description: '사용자의 전체 이름을 표시 가능한 형태로 나타냅니다 (예: "홍길동").',
    avatar: '아바타',
    avatar_description: '사용자의 아바타 이미지 URL입니다.',
    familyName: '성',
    familyName_description: '사용자의 성(씨)입니다 (예: "김").',
    givenName: '이름',
    givenName_description: '사용자의 이름입니다 (예: "길동").',
    middleName: '중간 이름',
    middleName_description: '사용자의 중간 이름입니다 (예: "철").',
    nickname: '별명',
    nickname_description: '사용자의 별명으로, 법적 이름과 다를 수 있습니다.',
    preferredUsername: '선호하는 사용자 이름',
    preferredUsername_description: '사용자가 선호하는 짧은 식별자입니다.',
    profile: '프로필',
    profile_description: '사용자의 프로필 페이지 URL입니다 (예: 소셜 미디어 프로필).',
    website: '웹사이트',
    website_description: '사용자의 개인 웹사이트 또는 블로그 URL입니다.',
    gender: '성별',
    gender_description: '사용자가 스스로 인식하는 성별입니다 (예: "여성", "남성", "논바이너리").',
    birthdate: '생년월일',
    birthdate_description: '사용자의 생년월일을 지정된 형식으로 나타냅니다 (예: "MM-dd-yyyy").',
    zoneinfo: '시간대',
    zoneinfo_description:
      '사용자의 시간대를 IANA 형식으로 나타냅니다 (예: "America/New_York" 또는 "Asia/Seoul").',
    locale: '언어',
    locale_description:
      '사용자의 언어를 IETF BCP 47 형식으로 나타냅니다 (예: "ko-KR" 또는 "en-US").',
    address: {
      formatted: '주소',
      streetAddress: '도로명 주소',
      locality: '도시',
      region: '주/도',
      postalCode: '우편번호',
      country: '국가',
    },
    address_description:
      '사용자의 전체 주소를 표시 가능한 형태로 나타냅니다 (예: "서울특별시 강남구 테헤란로 123").',
    fullname: '전체 이름',
    fullname_description: '설정에 따라 성, 이름, 중간 이름을 유연하게 조합합니다.',
  },
};

export default Object.freeze(profile);
