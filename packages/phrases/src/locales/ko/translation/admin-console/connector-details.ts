const connector_details = {
  page_title: '커넥터 세부 정보',
  back_to_connectors: '연동으로 돌아가기',
  check_readme: 'README 확인',
  settings: '일반 설정',
  settings_description:
    'Logto에서 연동은 중요한 역할을 해요. 연동 시스템을 통하여, 사용자들에게 비밀번호 없이 회원 가입을 하고 로그인을 할 수 있게 하거나, 소셜 계정을 통하여 로그인을 할 수 있게 도와줘요.',
  parameter_configuration: '매개변수 설정',
  test_connection: '연결 테스트',
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
};

export default connector_details;
