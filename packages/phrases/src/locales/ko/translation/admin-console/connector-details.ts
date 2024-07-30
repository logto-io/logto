const connector_details = {
  page_title: '커넥터 세부 정보',
  back_to_connectors: '연동으로 돌아가기',
  check_readme: 'README 확인',
  settings: '일반 설정',
  settings_description:
    'Logto에서 연동은 중요한 역할을 해요. 연동 시스템을 통하여, 사용자들에게 비밀번호 없이 회원 가입을 하고 로그인을 할 수 있게 하거나, 소셜 계정을 통하여 로그인을 할 수 있게 도와줘요.',
  parameter_configuration: '매개변수 설정',
  test_connection: '테스트',
  save_error_empty_config: '설정을 입력해 주세요.',
  send: '보내기',
  send_error_invalid_format: '유효하지 않은 입력',
  edit_config_label: '여기에 JSON을 입력해 주세요.',
  test_email_sender: '이메일 연동 테스트',
  test_sms_sender: 'SMS 연동 테스트',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+82 10-1234-5678',
  test_message_sent: '테스트 메세지 전송 완료',
  test_sender_description:
    'Logto는 "Generic" 템플릿을 사용하여 테스트합니다. 커넥터가 올바르게 구성되면 메시지를 받게 됩니다.',
  options_change_email: '이메일 연동 수정',
  options_change_sms: 'SMS 연동 수정',
  connector_deleted: '연동이 성공적으로 제거되었어요.',
  type_email: '이메일 연동',
  type_sms: 'SMS 연동',
  type_social: '소셜 연동',
  in_used_social_deletion_description:
    '이 연동은 로그인 경험에서 사용 중이에요. 삭제하면 로그인 경험 설정에서 <name/> 로그인 경험이 삭제됩니다. 나중에 되돌리려면 다시 구성해야 해요.',
  in_used_passwordless_deletion_description:
    '{name}}은/는 로그인 경험에서 사용 중이에요. 삭제하면 충돌을 해결할 때까지 로그인 환경이 제대로 작동하지 않을 거예요. 나중에 되돌리려면 다시 구성해야 해요.',
  deletion_description:
    '이 연동을 삭제하려고 하고 있어요. 이 작업은 돌이킬 수 없으며, 나중에 되돌리려면 다시 구성해야 해요.',
  logto_email: {
    total_email_sent: '전체 이메일 발송: {{value, number}}',
    total_email_sent_tip:
      'Logto 에서 안전하고 안정적인 내장형 이메일을 위해 SendGrid 를 사용합니다. 완전 무료로 사용할 수 있습니다. <a>자세히 알아보기</a>',
    email_template_title: '이메일 템플릿',
    template_description:
      '내장형 이메일은 기본 템플릿을 사용하여 검증 이메일을 원활하게 전달합니다. 구성이 필요하지 않으며, 기본 브랜드 정보를 사용자 정의할 수 있습니다.',
    template_description_link_text: '템플릿 보기',
    description_action_text: '템플릿 보기',
    from_email_field: '보내는 이메일',
    sender_name_field: '보내는 사람 이름',
    sender_name_tip:
      '이메일의 보내는 사람 이름을 사용자 정의합니다. 비워 두면 기본 이름으로 "Verification" 이 사용됩니다.',
    sender_name_placeholder: '보내는 사람 이름을 입력해주세요.',
    company_information_field: '회사 정보',
    company_information_description:
      '이메일 하단에 회사 이름, 주소 또는 우편번호를 표시하여 신뢰성을 높입니다.',
    company_information_placeholder: '회사의 기본 정보',
    email_logo_field: '이메일 로고',
    email_logo_tip:
      '이메일 상단에 브랜드 로고를 표시하세요. 라이트 모드와 다크 모드 모두에 동일한 이미지를 사용하세요.',
    urls_not_allowed: 'URL은 허용되지 않습니다.',
    test_notes: 'Logto는 "Generic" 템플릿을 사용하여 테스트합니다.',
  },
  google_one_tap: {
    title: 'Google 원탭',
    description:
      'Google 원탭은 사용자들이 당신의 웹사이트에 쉽게 로그인할 수 있는 안전한 방법입니다.',
    enable_google_one_tap: 'Google 원탭 활성화',
    enable_google_one_tap_description:
      '로그인 경험에서 Google 원탭을 활성화하세요: 사용자가 이미 자신의 기기에서 Google 계정에 로그인한 경우 빠르게 가입 또는 로그인할 수 있게 합니다.',
    configure_google_one_tap: 'Google 원탭 구성',
    auto_select: '가능한 경우 자격 증명 자동 선택',
    close_on_tap_outside: '사용자가 외부 클릭/탭 시 프롬프트 취소',
    itp_support: '<a>ITP 브라우저에서 업그레이드된 원탭 UX</a> 활성화',
  },
};

export default Object.freeze(connector_details);
